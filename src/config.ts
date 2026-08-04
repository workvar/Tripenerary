import type { Prefs } from '@/types';

export const STORAGE_KEYS = {
  // v2: a library of trips instead of a single source URL.
  trips: 'tc:trips',
  activeTrip: 'tc:activeTripId',
  prefs: 'tc:prefs',

  /** What each cached document was when we downloaded it, so refresh can tell if it changed. */
  documents: 'tc:documents',

  // v1 keys, read once during migration then dropped.
  legacySource: 'tc:sourceUrl',
  legacyData: 'tc:itinerary',
  legacySyncedAt: 'tc:syncedAt',
} as const satisfies Record<string, string>;

export const DEFAULT_PREFS: Prefs = {
  showMapPreview: true,
  showImages: true,
  autoRefreshOnLaunch: true,
};

/** Optional: ship a default itinerary URL so the app starts with one trip already added. */
export const DEFAULT_SOURCE_URL = '';

export const FETCH_TIMEOUT_MS = 15_000;

/** A trip is re-fetched at most once per calendar day on open, unless forced. */
export const AUTO_REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000;

export const SPLASH_MIN_MS = 1_600;

/**
 * Attached documents are downloaded the first time they are opened, then reused.
 *
 * The caps are deliberately conservative: this cache lives in the app's private
 * document directory, which counts against the phone's storage and is not something
 * a traveller should have to think about. A file over the limit still opens, it just
 * streams from the network instead of being kept.
 */
export const DOCUMENT_CACHE = {
  dirName: 'documents',
  maxFileBytes: 25 * 1024 * 1024,
  maxTripBytes: 150 * 1024 * 1024,
} as const;

/** Headers sent when downloading an attached document. */
export const DOCUMENT_HEADERS: Readonly<Record<string, string>> = {
  'User-Agent': 'Tripenerary/1.0 (https://github.com/tripenerary; itinerary companion app)',
  Accept: '*/*',
};

/**
 * Sent with every remote image request.
 *
 * React Native's Android image loader identifies itself as `okhttp/4.x`, and some
 * hosts reject that outright. Wikimedia is the notable one: its User-Agent policy
 * answers 403 to any generic or missing agent, which shows up as photos silently
 * failing while maps still work.
 *
 * Replace the contact URL with your own if you fork this.
 */
export const IMAGE_HEADERS: Readonly<Record<string, string>> = {
  'User-Agent': 'Tripenerary/1.0 (https://github.com/tripenerary; itinerary companion app)',
  Accept: 'image/avif,image/webp,image/jpeg,image/png,*/*',
};
