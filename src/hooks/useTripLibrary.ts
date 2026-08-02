import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { AUTO_REFRESH_INTERVAL_MS, DEFAULT_PREFS, DEFAULT_SOURCE_URL } from '@/config';
import { fetchItinerary } from '@/lib/fetchItinerary';
import { normalizeItinerary } from '@/lib/normalize';
import { summarise } from '@/lib/tripSummary';
import * as storage from '@/lib/storage';
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
  addTrip: (url: string) => Promise<Result<string>>;
  removeTrip: (id: string) => Promise<void>;
  openTrip: (id: string) => void;
  closeTrip: () => void;
  refreshTrip: (id: string, opts?: PullOptions) => Promise<Result<Itinerary>>;
  refreshAll: () => void;
  updatePrefs: (partial: Partial<Prefs>) => void;
  resetAll: () => Promise<void>;
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
  const [booting, setBooting] = useState(true);
  const [trips, setTrips] = useState<readonly TripRecord[]>([]);
  const [cache, setCache] = useState<ById<Itinerary>>({});
  const [status, setStatus] = useState<ById<TripFetchState>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [prefs, setPrefsState] = useState<Prefs>(DEFAULT_PREFS);

  // Refs mirror state so callbacks stay stable and never close over stale trips.
  const tripsRef = useRef<readonly TripRecord[]>(trips);
  const prefsRef = useRef<Prefs>(prefs);

  const setTripStatus = useCallback((id: string, patch: TripFetchState) => {
    setStatus((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }, []);

  const persist = useCallback((list: readonly TripRecord[]) => {
    tripsRef.current = list;
    setTrips(list);
    void storage.setTrips(list);
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
        setCache((prev) => ({ ...prev, [id]: data }));
        persist(
          tripsRef.current.map((t) => (t.id === id ? { ...t, ...summarise(data), syncedAt } : t))
        );
        setTripStatus(id, { refreshing: false, error: null });
        return ok(data);
      } catch (e) {
        const error = messageOf(e);
        setTripStatus(id, { refreshing: false, error: silent ? null : error });
        return fail(error);
      }
    },
    [persist, setTripStatus]
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
        list.map(async (t) => [t.id, safeNormalize(await storage.getTripData(t.id))] as const)
      );
      if (controller.signal.aborted) return;

      const loaded: Record<string, Itinerary> = {};
      for (const [id, data] of entries) if (data) loaded[id] = data;

      tripsRef.current = list;
      prefsRef.current = savedPrefs;
      setTrips(list);
      setCache(loaded);
      setPrefsState(savedPrefs);
      setActiveId(savedActive && list.some((t) => t.id === savedActive) ? savedActive : null);
      void storage.setTrips(list);
      setBooting(false);
      refreshStale(false);
    })();

    return () => controller.abort();
  }, [refreshStale]);

  // Coming back after a day away should quietly pick up itinerary edits.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') refreshStale(false);
    });
    return () => sub.remove();
  }, [refreshStale]);

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
        return res;
      }
      return ok(id);
    },
    [persist, pullTrip]
  );

  const removeTrip = useCallback(
    async (id: string): Promise<void> => {
      persist(tripsRef.current.filter((t) => t.id !== id));
      setCache(({ [id]: _removed, ...rest }) => rest);
      setActiveId((current) => (current === id ? null : current));
      await storage.removeTripData(id);
    },
    [persist]
  );

  const openTrip = useCallback(
    (id: string) => {
      setActiveId(id);
      void storage.setActiveTripId(id);
      void refreshTrip(id, { silent: true });
    },
    [refreshTrip]
  );

  const closeTrip = useCallback(() => {
    setActiveId(null);
    void storage.setActiveTripId(null);
  }, []);

  const updatePrefs = useCallback((partial: Partial<Prefs>) => {
    setPrefsState((prev) => {
      const next = { ...prev, ...partial };
      prefsRef.current = next;
      void storage.setPrefs(next);
      return next;
    });
  }, []);

  const resetAll = useCallback(async (): Promise<void> => {
    await storage.clearAll();
    tripsRef.current = [];
    setTrips([]);
    setCache({});
    setStatus({});
    setActiveId(null);
    setPrefsState(DEFAULT_PREFS);
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
    addTrip,
    removeTrip,
    openTrip,
    closeTrip,
    refreshTrip,
    refreshAll,
    updatePrefs,
    resetAll,
  };
}
