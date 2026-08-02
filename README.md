# Trip Companion

A React Native (Expo) app that turns a JSON file into a day-by-day travel companion.
Built for Android first, installs on iPhone too.

Nothing about any particular trip is hard-coded. You paste a link to a JSON file, the app
downloads it, saves a copy on the phone, and renders it. Change the JSON, pull to refresh,
and the phone updates.

## What it does

- **Top date bar** – scrollable strip of every day in the trip. Today is marked with a dot,
  and a "Jump to today" bar appears when you scroll away from it.
- **Day view** – day number, base city, title, summary, and a vertical timeline of the day's
  schedule with times, descriptions and costs.
- **Maps** – every location shows a small embedded map preview plus two buttons: open the place
  in Google Maps, or get directions to it. On Android it opens the native Google Maps app.
- **Stay card** – which hotel you are checked into on that day, with dates, confirmation number
  and a tappable phone number.
- **Local notes** – per-day tips.
- **Trip info screen** – emergency numbers, all stays, and practical information (visa, money,
  weather, etc.).
- **Works offline** – the last downloaded itinerary is cached. If the phone has no signal the
  app still opens the full trip and quietly says it is showing the saved copy.

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

You can also set `DEFAULT_SOURCE_URL` in `src/config.js` so the app ships pre-pointed at your
file and your parents never see the setup screen.

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

Check a file before publishing it:

```bash
node scripts/validate-itinerary.mjs sample/thailand-sample.json
```

It reports missing titles, bad dates, duplicate days, `stayId` values that point nowhere, and
coordinates out of range.

## Project layout

```
App.js                      screen switching
src/config.js               storage keys, defaults, optional built-in URL
src/theme.js                colours, spacing, type scale
src/lib/dates.js            YYYY-MM-DD helpers, no timezone drift
src/lib/maps.js             Google Maps URL building and native app handoff
src/lib/fetchItinerary.js   share-link rewriting, fetch with timeout
src/lib/normalize.js        validation and shaping of raw JSON
src/lib/storage.js          AsyncStorage wrapper
src/hooks/useItinerary.js   cache-first load, refresh, prefs
src/components/             DateStrip, ScheduleItem, StayCard, MapPreview, LocationRow, ...
src/screens/                Onboarding, Trip, Settings, Info
scripts/                    JSON validator, syntax checker
```

## Handing it to your parents

1. Put the JSON somewhere public (Gist is fine).
2. Set `DEFAULT_SOURCE_URL` in `src/config.js` to that link.
3. `eas build --profile preview --platform android`, send them the APK.

They open it and see today's plan. No setup screen, no accounts, and it keeps working in
airplane mode.
