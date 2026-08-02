# Tripenerary

A React Native (Expo) app that turns JSON files into day-by-day travel companions.
Built for Android first, installs on iPhone too.

Nothing about any particular trip is hard-coded. You paste a link to a JSON file, the app
downloads it, saves a copy on the phone, and renders it. Change the JSON, pull to refresh,
and the phone updates. You can keep several trips side by side.

## What it does

- **Splash screen** – animated compass mark while the trip library loads from disk.
- **Home screen** – one photo card per trip, sorted so whatever is happening now comes first.
  A badge shows "Day 3 · Now", "In 12 days" or "8 days ago". The **+** button adds another
  trip from a link; a long press removes one.
- **Daily refresh** – every trip re-downloads itself once a day when the app opens or returns
  to the foreground. The **↻** button on the home screen forces it immediately, and each trip
  has its own refresh button in Settings.
- **Top date bar** – scrollable strip of every day in the trip. Today is marked with a dot,
  and a "Jump to today" bar appears when you scroll away from it.
- **Day view** – optional hero photo, day number, base city, title and summary, then the
  schedule as full-width blocks: time on top, everything else underneath. No empty gutter.
- **Photos** – trips, days, schedule items and stays can all carry images. They fade in over a
  placeholder and are skipped silently if a link is dead. Turn them off in Settings.
- **Maps** – every location shows a small embedded map preview plus two buttons: open the place
  in Google Maps, or get directions to it. On Android it opens the native Google Maps app.
- **Stay card** – which hotel you are checked into on that day, with dates, confirmation number
  and a tappable phone number.
- **Local notes** – per-day tips.
- **Trip info screen** – emergency numbers, all stays, and practical information (visa, money,
  weather, etc.).
- **Works offline** – every downloaded itinerary is cached separately. If the phone has no
  signal the app still opens the full trip and quietly says it is showing the saved copy.

## Getting started

```bash
npm install
npx expo start
```

Scan the QR code with **Expo Go** on the phone. That is enough to see everything except the
embedded map previews, which need a native build (see below).

### Building an installable app

```bash
npm install -g eas-cli
eas login
eas build --profile preview --platform android   # produces an .apk you can sideload
eas build --profile preview --platform ios       # needs an Apple Developer account
```

For iPhone without a paid Apple account, the practical options are Expo Go, or
`npx expo run:ios` on a Mac with the phone plugged in (7-day signing).

### Google Maps API key (only needed for the embedded previews)

The "Open in Maps" and "Directions" buttons work with no key at all. The small preview map
needs one on Android.

1. Google Cloud Console → enable **Maps SDK for Android**.
2. Create an API key, restrict it to your Android package name `com.tripcompanion.app`.
3. Put it in `app.json` under `expo.android.config.googleMaps.apiKey`.

On iOS the preview uses Apple Maps, so no key is required.

If you would rather skip all of this, turn off **Show map previews** in Settings. Everything
else keeps working.

## Hosting the itinerary JSON

Any URL that returns raw JSON works. These share links are rewritten automatically:

| You paste | App fetches |
|---|---|
| `https://github.com/user/repo/blob/main/trip.json` | the `raw.githubusercontent.com` version |
| `https://gist.github.com/user/abc123` | the `/raw` version |
| `https://drive.google.com/file/d/FILEID/view` | the direct-download version |
| `https://www.dropbox.com/s/.../trip.json?dl=0` | the `dl=1` version |

A public GitHub Gist is the easiest option: create it, paste the URL, done. Editing the Gist
and pulling to refresh in the app updates the trip.

You can also set `DEFAULT_SOURCE_URL` in `src/config.js` so the app ships with that trip
already in the library and your parents never see an empty home screen.

## Writing the JSON

See `schema/itinerary.schema.json` for the full contract and `sample/thailand-sample.json` for a
complete 12-day example. Minimum viable file:

```json
{
  "trip": {
    "title": "Thailand",
    "startDate": "2026-08-22",
    "endDate": "2026-09-02",
    "timezone": "Asia/Bangkok"
  },
  "days": [
    {
      "date": "2026-08-22",
      "base": "Bangkok",
      "title": "Arrival",
      "items": [
        {
          "time": "09:00",
          "title": "Wat Pho",
          "type": "sight",
          "description": "The Reclining Buddha.",
          "location": { "name": "Wat Pho", "lat": 13.7465, "lng": 100.4927 }
        }
      ]
    }
  ]
}
```

Notes on the fields:

- `trip.timezone` decides what counts as "today". Set it to the destination, not home.
- `days` are sorted by date automatically, and day numbers are assigned from that order.
- `items[].type` is one of `sight`, `food`, `travel`, `flight`, `hotel`, `activity`, `rest`,
  `note`. It only picks the icon.
- `items[].time` can be free text like `"Morning"` if there is no fixed hour.
- `location` needs either `lat`/`lng`, or a `name`/`address` to search for. Add
  `googleMapsUrl` to override the generated link entirely.
- `days[].stayId` points at an entry in `stays[]` and drives the hotel card.

### Photos

Four optional image fields, all plain https URLs:

| Field | Where it shows |
|---|---|
| `trip.coverImage` | behind the trip card on the home screen |
| `days[].image` | hero banner at the top of that day |
| `days[].items[].images` | inside the schedule block, swipeable if there is more than one |
| `stays[].image` | top of the stay card |

Each accepts a bare string or an object, and `items[].images` also accepts an array:

```json
"images": [
  "https://example.com/beach.jpg",
  { "url": "https://example.com/temple.jpg", "caption": "Wat Arun at sunset" }
]
```

Anything that is not an `https://` URL is ignored, and an image that fails to load leaves no
gap in the layout. Point at a host that allows hotlinking; the sample uses Wikimedia Commons
`Special:FilePath` links, which resize on request via `?width=1400`.

Check a file before publishing it:

```bash
node scripts/validate-itinerary.mjs sample/thailand-sample.json
```

It reports missing titles, bad dates, duplicate days, `stayId` values that point nowhere,
coordinates out of range, and image URLs that will not load on a phone.

## Project layout

```
App.js                      splash, base screen, overlays
src/config.js               storage keys, defaults, refresh interval, optional built-in URL
src/theme.js                colours, spacing, type scale, elevation
src/lib/dates.js            YYYY-MM-DD helpers, no timezone drift
src/lib/maps.js             Google Maps URL building and native app handoff
src/lib/fetchItinerary.js   share-link rewriting, fetch with timeout
src/lib/normalize.js        validation and shaping of raw JSON
src/lib/images.js           image field parsing
src/lib/tripSummary.js      card summaries, live/upcoming/past status, ordering
src/lib/storage.js          AsyncStorage wrapper, trip index, v1 migration
src/hooks/useTripLibrary.js the whole library: add, remove, open, refresh, prefs
src/components/             TripCard, AddTripSheet, DateStrip, ScheduleItem, SmartImage, ...
src/screens/                Splash, Landing, Trip, Settings, Info
scripts/                    JSON validator, syntax checker
```

Trips added in an older build are migrated into the library automatically on first launch.

## Handing it to your parents

1. Put the JSON somewhere public (Gist is fine).
2. Set `DEFAULT_SOURCE_URL` in `src/config.js` to that link.
3. `eas build --profile preview --platform android`, send them the APK.

They open it and see today's plan. No setup screen, no accounts, and it keeps working in
airplane mode.
