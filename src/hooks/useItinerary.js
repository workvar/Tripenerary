import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_SOURCE_URL, DEFAULT_PREFS } from '../config';
import { fetchItinerary } from '../lib/fetchItinerary';
import { normalizeItinerary } from '../lib/normalize';
import * as storage from '../lib/storage';

const initial = {
  loading: true,
  refreshing: false,
  data: null,
  error: null,
  sourceUrl: '',
  syncedAt: null,
  prefs: DEFAULT_PREFS,
};

export default function useItinerary() {
  const [state, setState] = useState(initial);
  const patch = (p) => setState((s) => ({ ...s, ...p }));

  const loadFromNetwork = useCallback(async (url, { silent } = {}) => {
    if (!url) return { ok: false, error: 'No link set yet.' };
    patch({ refreshing: true, error: null });
    try {
      const raw = await fetchItinerary(url);
      const data = normalizeItinerary(raw);
      const now = new Date().toISOString();
      await storage.setCachedItinerary(raw);
      await storage.setSyncedAt(now);
      patch({ data, syncedAt: now, refreshing: false, error: null });
      return { ok: true };
    } catch (e) {
      const message = e.message || 'Something went wrong loading the itinerary.';
      patch({ refreshing: false, error: silent ? null : message });
      return { ok: false, error: message };
    }
  }, []);

  // Boot: cache first so the app is usable offline, then refresh in background.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [savedUrl, cached, syncedAt, prefs] = await Promise.all([
        storage.getSourceUrl(),
        storage.getCachedItinerary(),
        storage.getSyncedAt(),
        storage.getPrefs(),
      ]);
      if (cancelled) return;

      const url = savedUrl || DEFAULT_SOURCE_URL;
      let data = null;
      if (cached) {
        try {
          data = normalizeItinerary(cached);
        } catch (e) {
          data = null;
        }
      }
      patch({ loading: false, data, sourceUrl: url || '', syncedAt, prefs });

      if (url && prefs.autoRefreshOnLaunch) {
        loadFromNetwork(url, { silent: !!data });
      } else if (url && !data) {
        loadFromNetwork(url);
      }
    })();
    return () => { cancelled = true; };
  }, [loadFromNetwork]);

  const setSource = useCallback(async (url) => {
    const trimmed = String(url || '').trim();
    await storage.setSourceUrl(trimmed);
    patch({ sourceUrl: trimmed });
    return loadFromNetwork(trimmed);
  }, [loadFromNetwork]);

  const refresh = useCallback(
    () => loadFromNetwork(state.sourceUrl),
    [loadFromNetwork, state.sourceUrl]
  );

  const updatePrefs = useCallback(async (partial) => {
    setState((s) => {
      const next = { ...s.prefs, ...partial };
      storage.setPrefs(next);
      return { ...s, prefs: next };
    });
  }, []);

  const reset = useCallback(async () => {
    await storage.clearAll();
    setState({ ...initial, loading: false });
  }, []);

  return { ...state, setSource, refresh, updatePrefs, reset };
}
