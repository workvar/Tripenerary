/**
 * Device profiles and the shot list, shared by capture-screenshots.mjs and
 * fit-screenshots.py (which reads this file's JSON export via `--profiles`).
 *
 * Play requirements this encodes (support.google.com/googleplay/android-developer/answer/9866151):
 *   - 24-bit PNG or JPEG, no alpha
 *   - min side 320px, max side 3840px, longest side <= 2x shortest
 *   - phones: at least 4 shots at >= 1080px for homepage recommendation slots
 *   - tablets and Chromebook: at least 4 shots, 1080-7680px, 16:9 or 9:16
 *
 * Tripenerary's MainActivity is android:screenOrientation="portrait", so every
 * profile here is 9:16. That is an accepted ratio on large screens too. If the
 * app ever unlocks landscape, add 16:9 variants for tablet10 and chromebook.
 */

export const PROFILES = {
  phone: {
    label: 'Phone (required, min 2, aim for 4-8)',
    width: 1080,
    height: 1920,
    ratio: '9:16',
    avd: 'Pixel 6 · 1080x2400 · API 34',
  },
  tablet7: {
    label: '7-inch tablet (min 4 if you claim tablet support)',
    width: 1200,
    height: 1920,
    ratio: '9:16 (padded)',
    avd: 'Nexus 7 · 1200x1920 · API 34',
  },
  tablet10: {
    label: '10-inch tablet (min 4 if you claim tablet support)',
    width: 1600,
    height: 2560,
    ratio: '9:16 (padded)',
    avd: 'Pixel Tablet · 1600x2560 · API 34',
  },
  chromebook: {
    label: 'Chromebook (min 4 if you opt in to Chrome OS)',
    width: 1080,
    height: 1920,
    ratio: '9:16',
    avd: 'Desktop / Chrome OS AVD, or a real Chromebook with ADB debugging on',
  },
};

/** The screens Play reviewers and users most want to see, in order. */
export const SHOTS = [
  {
    name: 'trip-library',
    prompt: 'Home screen: trip library with at least two trip cards, one showing a "Now" badge.',
  },
  {
    name: 'day-view',
    prompt: 'Day view: a day with a hero photo, summary and three or more schedule blocks.',
  },
  {
    name: 'schedule-map',
    prompt: 'Scroll to a schedule item with the embedded map preview and the Maps / Directions buttons visible.',
  },
  {
    name: 'stay-card',
    prompt: 'A day showing the stay card with dates, confirmation number and phone number.',
  },
  {
    name: 'date-strip',
    prompt: 'Scroll the bottom date strip a few days away so the "Jump to today" bar is showing.',
  },
  {
    name: 'documents',
    prompt: 'A schedule block or trip header with attached PDF documents visible.',
  },
  {
    name: 'trip-info',
    prompt: 'Trip info screen: emergency numbers, stays and practical information.',
  },
  {
    name: 'settings',
    prompt: 'Settings screen showing refresh, image toggle and cached document size.',
  },
];

/** Alt text for Play Console, keyed by shot name. Keep each under 140 chars. */
export const ALT_TEXT = {
  'trip-library': 'Trip library listing saved trips, with the current trip marked as happening now.',
  'day-view': 'A single day of the itinerary with a photo, summary and timed schedule blocks.',
  'schedule-map': 'A schedule item with a map preview and buttons to open Google Maps or directions.',
  'stay-card': 'Hotel stay card showing check-in dates, confirmation number and phone number.',
  'date-strip': 'Bottom date strip for moving between days, with a jump to today shortcut.',
  documents: 'Itinerary items with attached PDF tickets and booking confirmations.',
  'trip-info': 'Trip info screen with emergency numbers, stays and practical travel notes.',
  settings: 'Settings screen with refresh controls, image toggle and cached document size.',
};
