export const STORAGE_KEYS = {
  source: 'tc:sourceUrl',
  data: 'tc:itinerary',
  syncedAt: 'tc:syncedAt',
  prefs: 'tc:prefs',
};

export const DEFAULT_PREFS = {
  showMapPreview: true,
  autoRefreshOnLaunch: true,
};

// Optional: ship a default itinerary URL so the app loads with no setup.
export const DEFAULT_SOURCE_URL = '';

export const FETCH_TIMEOUT_MS = 15000;
