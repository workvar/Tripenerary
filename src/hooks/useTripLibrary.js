import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { AUTO_REFRESH_INTERVAL_MS, DEFAULT_PREFS, DEFAULT_SOURCE_URL } from '../config';
import { fetchItinerary } from '../lib/fetchItinerary';
import { normalizeItinerary } from '../lib/normalize';
import { summarise } from '../lib/tripSummary';
import * as storage from '../lib/storage';

const newId = () => 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

const isStale = (syncedAt) =>
  !syncedAt || Date.now() - new Date(syncedAt).getTime() > AUTO_REFRESH_INTERVAL_MS;

function safeNormalize(raw) {
  if (!raw) return null;
  try {
    return normalizeItinerary(raw);
  } catch (e) {
    return null;
  }
}

export default function useTripLibrary() {
  const [booting, setBooting] = useState(true);
  const [trips, setTrips] = useState([]);
  const [cache, setCache] = useState({});      // id -> normalized itinerary
  const [status, setStatus] = useState({});    // id -> { refreshing, error }
  const [activeId, setActiveId] = useState(null);
  const [prefs, setPrefsState] = useState(DEFAULT_PREFS);
  const prefsRef = useRef(DEFAULT_PREFS);
  const tripsRef = useRef([]);

  useEffect(() => { tripsRef.current = trips; }, [trips]);
  useEffect(() => { prefsRef.current = prefs; }, [prefs]);

  const setTripStatus = useCallback((id, patch) => {
    setStatus((s) => ({ ...s, [id]: { ...(s[id] || {}), ...patch } }));
  }, []);

  const persist = useCallback((list) => {
    tripsRef.current = list;
    setTrips(list);
    storage.setTrips(list);
  }, []);

  /* ---------- network ---------- */

  const pullTrip = useCallback(async (id, url, { silent } = {}) => {
    if (!url) return { ok: false, error: 'This trip has no link saved.' };
    setTripStatus(id, { refreshing: true, error: null });
    try {
      const raw = await fetchItinerary(url);
      const data = normalizeItinerary(raw);
      const syncedAt = new Date().toISOString();
      await storage.setTripData(id, raw);
      setCache((c) => ({ ...c, [id]: data }));
      persist(
        tripsRef.current.map((t) =>
          t.id === id ? { ...t, ...summarise(data), syncedAt } : t
        )
      );
      setTripStatus(id, { refreshing: false, error: null });
      return { ok: true, data };
    } catch (e) {
      const error = e.message || 'Could not load that itinerary.';
      setTripStatus(id, { refreshing: false, error: silent ? null : error });
      return { ok: false, error };
    }
  }, [persist, setTripStatus]);

  const refreshTrip = useCallback(
    (id, opts) => {
      const trip = tripsRef.current.find((t) => t.id === id);
      return trip ? pullTrip(id, trip.url, opts) : Promise.resolve({ ok: false });
    },
    [pullTrip]
  );

  // Called on boot and whenever the app returns to the foreground.
  const refreshStale = useCallback((force) => {
    if (!force && !prefsRef.current.autoRefreshOnLaunch) return;
    tripsRef.current.forEach((t) => {
      if (t.url && (force || isStale(t.syncedAt))) pullTrip(t.id, t.url, { silent: true });
    });
  }, [pullTrip]);

  /* ---------- boot ---------- */

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [savedPrefs, savedActive] = await Promise.all([
        storage.getPrefs(),
        storage.getActiveTripId(),
      ]);
      let list = await storage.getTrips();

      const legacy = await storage.migrateLegacy();
      if (legacy) {
        const data = safeNormalize(legacy.raw);
        list = [...list, { ...legacy, raw: undefined, ...summarise(data) }];
      }
      if (list.length === 0 && DEFAULT_SOURCE_URL) {
        list = [{ id: newId(), url: DEFAULT_SOURCE_URL, addedAt: new Date().toISOString(), syncedAt: null }];
      }

      const loaded = {};
      await Promise.all(
        list.map(async (t) => {
          const data = safeNormalize(await storage.getTripData(t.id));
          if (data) loaded[t.id] = data;
        })
      );
      if (cancelled) return;

      tripsRef.current = list;
      prefsRef.current = savedPrefs;
      setTrips(list);
      setCache(loaded);
      setPrefsState(savedPrefs);
      setActiveId(savedActive && list.some((t) => t.id === savedActive) ? savedActive : null);
      storage.setTrips(list);
      setBooting(false);
      refreshStale(false);
    })();
    return () => { cancelled = true; };
  }, [refreshStale]);

  // Coming back after a day away should quietly pick up itinerary edits.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') refreshStale(false);
    });
    return () => sub.remove();
  }, [refreshStale]);

  /* ---------- library actions ---------- */

  const addTrip = useCallback(async (url) => {
    const trimmed = String(url || '').trim();
    const existing = tripsRef.current.find((t) => t.url === trimmed);
    if (existing) return { ok: false, error: 'That trip is already in your list.' };

    const id = newId();
    const entry = { id, url: trimmed, addedAt: new Date().toISOString(), syncedAt: null };
    persist([...tripsRef.current, entry]);

    const res = await pullTrip(id, trimmed);
    if (!res.ok) {
      persist(tripsRef.current.filter((t) => t.id !== id));
      await storage.removeTripData(id);
      return res;
    }
    return { ok: true, id };
  }, [persist, pullTrip]);

  const removeTrip = useCallback(async (id) => {
    persist(tripsRef.current.filter((t) => t.id !== id));
    setCache((c) => { const n = { ...c }; delete n[id]; return n; });
    await storage.removeTripData(id);
    setActiveId((a) => (a === id ? null : a));
  }, [persist]);

  const openTrip = useCallback((id) => {
    setActiveId(id);
    storage.setActiveTripId(id);
    refreshTrip(id, { silent: true });
  }, [refreshTrip]);

  const closeTrip = useCallback(() => {
    setActiveId(null);
    storage.setActiveTripId(null);
  }, []);

  const updatePrefs = useCallback((partial) => {
    setPrefsState((p) => {
      const next = { ...p, ...partial };
      prefsRef.current = next;
      storage.setPrefs(next);
      return next;
    });
  }, []);

  const resetAll = useCallback(async () => {
    await storage.clearAll();
    tripsRef.current = [];
    setTrips([]);
    setCache({});
    setStatus({});
    setActiveId(null);
    setPrefsState(DEFAULT_PREFS);
  }, []);

  const activeTrip = activeId ? trips.find((t) => t.id === activeId) || null : null;

  return {
    booting,
    trips,
    cache,
    status,
    prefs,
    activeId,
    activeTrip,
    activeData: activeId ? cache[activeId] || null : null,
    activeStatus: (activeId && status[activeId]) || {},
    addTrip,
    removeTrip,
    openTrip,
    closeTrip,
    refreshTrip,
    refreshAll: () => refreshStale(true),
    updatePrefs,
    resetAll,
  };
}
