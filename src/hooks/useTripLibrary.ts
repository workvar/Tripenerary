import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { AUTO_REFRESH_INTERVAL_MS, DEFAULT_PREFS, DEFAULT_SOURCE_URL } from '@/config';
import { fetchItinerary } from '@/lib/fetchItinerary';
import { normalizeItinerary } from '@/lib/normalize';
import { summarise } from '@/lib/tripSummary';
import * as storage from '@/lib/storage';
import * as cloud from '@/lib/cloudSync';
import { clearDocumentCache, forgetTrip, syncTripCache, totalBytes } from '@/lib/cache';
import { useAuth } from '@/hooks/useAuth';
import {
  fail,
  ok,
  type Itinerary,
  type Prefs,
  type RawItinerary,
  type Result,
  type TripFetchState,
  type TripRecord,
} from '@/types';

type ById<T> = Readonly<Record<string, T>>;

export interface TripLibrary {
  readonly booting: boolean;
  readonly trips: readonly TripRecord[];
  readonly cache: ById<Itinerary>;
  readonly status: ById<TripFetchState>;
  readonly prefs: Prefs;
  readonly activeId: string | null;
  readonly activeTrip: TripRecord | null;
  readonly activeData: Itinerary | null;
  readonly activeStatus: TripFetchState;
  readonly anyRefreshing: boolean;
  /** Cloud account sync in progress after sign-in. */
  readonly syncingAccount: boolean;
  addTrip: (url: string) => Promise<Result<string>>;
  removeTrip: (id: string) => Promise<void>;
  openTrip: (id: string) => void;
  closeTrip: () => void;
  refreshTrip: (id: string, opts?: PullOptions) => Promise<Result<Itinerary>>;
  refreshAll: () => void;
  updatePrefs: (partial: Partial<Prefs>) => void;
  resetAll: () => Promise<void>;
  /** Bytes of downloaded documents across every trip. */
  readonly documentBytes: number;
  clearDocuments: () => Promise<void>;
}

interface PullOptions {
  /** Swallow the error so a background refresh never covers a cached trip in red. */
  readonly silent?: boolean;
}

const newId = (): string =>
  `t${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const isStale = (syncedAt: string | null): boolean =>
  !syncedAt || Date.now() - new Date(syncedAt).getTime() > AUTO_REFRESH_INTERVAL_MS;

function safeNormalize(raw: RawItinerary): Itinerary | null {
  if (!raw) return null;
  try {
    return normalizeItinerary(raw);
  } catch {
    return null;
  }
}

const messageOf = (e: unknown): string =>
  e instanceof Error ? e.message : 'Could not load that itinerary.';

export default function useTripLibrary(): TripLibrary {
  const { uid } = useAuth();
  const [booting, setBooting] = useState(true);
  const [syncingAccount, setSyncingAccount] = useState(false);
  const [trips, setTrips] = useState<readonly TripRecord[]>([]);
  const [cache, setCache] = useState<ById<Itinerary>>({});
  const [rawCache, setRawCache] = useState<ById<RawItinerary>>({});
  const [status, setStatus] = useState<ById<TripFetchState>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [prefs, setPrefsState] = useState<Prefs>(DEFAULT_PREFS);
  const [documentBytes, setDocumentBytes] = useState(0);

  const measureDocuments = useCallback(() => setDocumentBytes(totalBytes()), []);

  // Refs mirror state so callbacks stay stable and never close over stale trips.
  const tripsRef = useRef<readonly TripRecord[]>(trips);
  const prefsRef = useRef<Prefs>(prefs);
  const rawCacheRef = useRef<ById<RawItinerary>>(rawCache);
  const uidRef = useRef<string | null>(uid);
  const syncedUidRef = useRef<string | null>(null);

  uidRef.current = uid;

  const setTripStatus = useCallback((id: string, patch: TripFetchState) => {
    setStatus((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }, []);

  const persist = useCallback((list: readonly TripRecord[]) => {
    tripsRef.current = list;
    setTrips(list);
    void storage.setTrips(list);
  }, []);

  const rememberRaw = useCallback((id: string, raw: RawItinerary) => {
    setRawCache((prev) => {
      const next = { ...prev, [id]: raw };
      rawCacheRef.current = next;
      return next;
    });
  }, []);

  const forgetRaw = useCallback((id: string) => {
    setRawCache(({ [id]: _removed, ...rest }) => {
      rawCacheRef.current = rest;
      return rest;
    });
  }, []);

  /* ---------- network ---------- */

  const pullTrip = useCallback(
    async (id: string, url: string, { silent }: PullOptions = {}): Promise<Result<Itinerary>> => {
      if (!url) return fail('This trip has no link saved.');

      setTripStatus(id, { refreshing: true, error: null });
      try {
        const raw = await fetchItinerary(url);
        const data = normalizeItinerary(raw);
        const syncedAt = new Date().toISOString();

        await storage.setTripData(id, raw);
        rememberRaw(id, raw);
        setCache((prev) => ({ ...prev, [id]: data }));
        const nextList = tripsRef.current.map((t) =>
          t.id === id ? { ...t, ...summarise(data), syncedAt } : t
        );
        persist(nextList);
        setTripStatus(id, { refreshing: false, error: null });

        const account = uidRef.current;
        if (account) {
          const updated = nextList.find((t) => t.id === id);
          if (updated) void cloud.pushTrip(account, updated, raw);
        }

        // Sweep documents that left the itinerary and re-pull the ones that
        // changed. Deliberately not awaited: the trip is already on screen, and
        // a slow HEAD on a bad connection must not hold up the refresh spinner.
        void syncTripCache(id, data).then(measureDocuments, () => undefined);

        return ok(data);
      } catch (e) {
        const error = messageOf(e);
        setTripStatus(id, { refreshing: false, error: silent ? null : error });
        return fail(error);
      }
    },
    [measureDocuments, persist, rememberRaw, setTripStatus]
  );

  const refreshTrip = useCallback(
    (id: string, opts?: PullOptions): Promise<Result<Itinerary>> => {
      const trip = tripsRef.current.find((t) => t.id === id);
      return trip ? pullTrip(id, trip.url, opts) : Promise.resolve(fail('Unknown trip.'));
    },
    [pullTrip]
  );

  /** Called on boot and whenever the app returns to the foreground. */
  const refreshStale = useCallback(
    (force: boolean) => {
      if (!force && !prefsRef.current.autoRefreshOnLaunch) return;
      for (const trip of tripsRef.current) {
        if (trip.url && (force || isStale(trip.syncedAt))) {
          void pullTrip(trip.id, trip.url, { silent: true });
        }
      }
    },
    [pullTrip]
  );

  /* ---------- boot ---------- */

  useEffect(() => {
    const controller = new AbortController();

    void (async () => {
      const [savedPrefs, savedActive, saved] = await Promise.all([
        storage.getPrefs(),
        storage.getActiveTripId(),
        storage.getTrips(),
      ]);

      let list = saved;
      const legacy = await storage.migrateLegacy();
      if (legacy) {
        const { raw, ...record } = legacy;
        list = [...list, { ...record, ...summarise(safeNormalize(raw)) }];
      }
      if (list.length === 0 && DEFAULT_SOURCE_URL) {
        list = [
          { id: newId(), url: DEFAULT_SOURCE_URL, addedAt: new Date().toISOString(), syncedAt: null },
        ];
      }

      const entries = await Promise.all(
        list.map(async (t) => [t.id, await storage.getTripData(t.id)] as const)
      );
      if (controller.signal.aborted) return;

      const loaded: Record<string, Itinerary> = {};
      const raws: Record<string, RawItinerary> = {};
      for (const [id, raw] of entries) {
        raws[id] = raw;
        const data = safeNormalize(raw);
        if (data) loaded[id] = data;
      }

      tripsRef.current = list;
      prefsRef.current = savedPrefs;
      rawCacheRef.current = raws;
      setTrips(list);
      setCache(loaded);
      setRawCache(raws);
      setPrefsState(savedPrefs);
      setActiveId(savedActive && list.some((t) => t.id === savedActive) ? savedActive : null);
      void storage.setTrips(list);
      measureDocuments();
      setBooting(false);
      refreshStale(false);
    })();

    return () => controller.abort();
  }, [measureDocuments, refreshStale]);

  // Coming back after a day away should quietly pick up itinerary edits.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') refreshStale(false);
    });
    return () => sub.remove();
  }, [refreshStale]);

  /* ---------- account sync ---------- */

  const activeIdRef = useRef<string | null>(activeId);
  activeIdRef.current = activeId;

  useEffect(() => {
    if (booting) return;

    if (!uid) {
      syncedUidRef.current = null;
      setSyncingAccount(false);
      return;
    }

    if (syncedUidRef.current === uid) return;

    const account = uid;
    let cancelled = false;

    void (async () => {
      setSyncingAccount(true);
      try {
        const remote = await cloud.pullLibrary(account);
        if (cancelled) return;

        if (!remote || (remote.trips.length === 0 && !remote.updatedAt)) {
          // Cloud empty / unavailable — push local snapshot so the account has a copy.
          await cloud.pushPrefs(account, prefsRef.current);
          await cloud.pushActiveTripId(account, activeIdRef.current);
          await cloud.pushTrips(account, tripsRef.current, rawCacheRef.current);
          syncedUidRef.current = account;
          return;
        }

        const merged = cloud.mergeLibraries(
          {
            prefs: prefsRef.current,
            activeTripId: activeIdRef.current,
            trips: tripsRef.current,
            tripData: rawCacheRef.current,
          },
          remote
        );

        const loaded: Record<string, Itinerary> = {};
        for (const [id, raw] of Object.entries(merged.tripData)) {
          const data = safeNormalize(raw);
          if (data) loaded[id] = data;
          await storage.setTripData(id, raw);
        }

        tripsRef.current = merged.trips;
        prefsRef.current = merged.prefs;
        rawCacheRef.current = merged.tripData;
        setTrips(merged.trips);
        setCache(loaded);
        setRawCache(merged.tripData);
        setPrefsState(merged.prefs);
        setActiveId(merged.activeTripId);

        await Promise.all([
          storage.setTrips(merged.trips),
          storage.setPrefs(merged.prefs),
          storage.setActiveTripId(merged.activeTripId),
          cloud.pushPrefs(account, merged.prefs),
          cloud.pushActiveTripId(account, merged.activeTripId),
          cloud.pushTrips(account, merged.trips, merged.tripData),
        ]);

        syncedUidRef.current = account;
        refreshStale(false);
      } catch {
        // Stay on local data; next launch or mutation can retry.
      } finally {
        if (!cancelled) setSyncingAccount(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [booting, uid, refreshStale]);

  /* ---------- library actions ---------- */

  const addTrip = useCallback(
    async (url: string): Promise<Result<string>> => {
      const trimmed = url.trim();
      if (tripsRef.current.some((t) => t.url === trimmed)) {
        return fail('That trip is already in your list.');
      }

      const id = newId();
      persist([
        ...tripsRef.current,
        { id, url: trimmed, addedAt: new Date().toISOString(), syncedAt: null },
      ]);

      const res = await pullTrip(id, trimmed);
      if (!res.ok) {
        persist(tripsRef.current.filter((t) => t.id !== id));
        await storage.removeTripData(id);
        await forgetTrip(id);
        forgetRaw(id);
        return res;
      }
      return ok(id);
    },
    [forgetRaw, persist, pullTrip]
  );

  const removeTrip = useCallback(
    async (id: string): Promise<void> => {
      persist(tripsRef.current.filter((t) => t.id !== id));
      setCache(({ [id]: _removed, ...rest }) => rest);
      forgetRaw(id);
      setActiveId((current) => {
        if (current === id) {
          void storage.setActiveTripId(null);
          const account = uidRef.current;
          if (account) void cloud.pushActiveTripId(account, null);
          return null;
        }
        return current;
      });
      await storage.removeTripData(id);
      // The trip's whole document folder goes with it, not just its JSON.
      await forgetTrip(id);
      measureDocuments();
      const account = uidRef.current;
      if (account) void cloud.deleteCloudTrip(account, id);
    },
    [forgetRaw, measureDocuments, persist]
  );

  const openTrip = useCallback(
    (id: string) => {
      setActiveId(id);
      void storage.setActiveTripId(id);
      const account = uidRef.current;
      if (account) void cloud.pushActiveTripId(account, id);
      void refreshTrip(id, { silent: true });
    },
    [refreshTrip]
  );

  const closeTrip = useCallback(() => {
    setActiveId(null);
    void storage.setActiveTripId(null);
    const account = uidRef.current;
    if (account) void cloud.pushActiveTripId(account, null);
  }, []);

  const updatePrefs = useCallback((partial: Partial<Prefs>) => {
    setPrefsState((prev) => {
      const next = { ...prev, ...partial };
      prefsRef.current = next;
      void storage.setPrefs(next);
      const account = uidRef.current;
      if (account) void cloud.pushPrefs(account, next);
      return next;
    });
  }, []);

  const resetAll = useCallback(async (): Promise<void> => {
    const account = uidRef.current;
    await storage.clearAll();
    await clearDocumentCache();
    if (account) await cloud.clearCloudLibrary(account);
    tripsRef.current = [];
    rawCacheRef.current = {};
    setTrips([]);
    setCache({});
    setRawCache({});
    setStatus({});
    setActiveId(null);
    setPrefsState(DEFAULT_PREFS);
    prefsRef.current = DEFAULT_PREFS;
    setDocumentBytes(0);
  }, []);

  const clearDocuments = useCallback(async (): Promise<void> => {
    await clearDocumentCache();
    setDocumentBytes(0);
  }, []);

  const refreshAll = useCallback(() => refreshStale(true), [refreshStale]);

  const activeTrip = useMemo(
    () => (activeId ? (trips.find((t) => t.id === activeId) ?? null) : null),
    [activeId, trips]
  );

  const anyRefreshing = useMemo(
    () => Object.values(status).some((s) => s.refreshing),
    [status]
  );

  return {
    booting,
    trips,
    cache,
    status,
    prefs,
    activeId,
    activeTrip,
    activeData: activeId ? (cache[activeId] ?? null) : null,
    activeStatus: (activeId ? status[activeId] : undefined) ?? {},
    anyRefreshing,
    syncingAccount,
    addTrip,
    removeTrip,
    openTrip,
    closeTrip,
    refreshTrip,
    refreshAll,
    updatePrefs,
    resetAll,
    documentBytes,
    clearDocuments,
  };
}
