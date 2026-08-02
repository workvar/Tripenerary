import type { Prefs } from '@/types';

export const STORAGE_KEYS = {
  // v2: a library of trips instead of a single source URL.
  trips: 'tc:trips',
  activeTrip: 'tc:activeTripId',
  prefs: 'tc:prefs',

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
