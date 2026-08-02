export const STORAGE_KEYS = {
  // v2: a library of trips instead of a single source URL.
  trips: 'tc:trips',
  activeTrip: 'tc:activeTripId',
  prefs: 'tc:prefs',

  // v1 keys, read once during migration then dropped.
  legacySource: 'tc:sourceUrl',
  legacyData: 'tc:itinerary',
  legacySyncedAt: 'tc:syncedAt',
};

export const DEFAULT_PREFS = {
  showMapPreview: true,
  showImages: true,
  autoRefreshOnLaunch: true,
};

// Optional: ship a default itinerary URL so the app starts with one trip already added.
export const DEFAULT_SOURCE_URL = '';

export const FETCH_TIMEOUT_MS = 15000;

// A trip is re-fetched at most once per calendar day on open, unless forced.
export const AUTO_REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000;

export const SPLASH_MIN_MS = 1600;
