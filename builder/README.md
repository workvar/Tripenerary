# Trip Companion Builder

A local web editor that produces the itinerary JSON the Expo app reads. Left side
is the editor, right side is a phone showing exactly what the app will render.

## Running it

```bash
cd builder
npm install
npm run dev        # http://localhost:4000
```

With Firebase configured (`builder/.env.local`), the builder opens on `/login`.
Sign in with **Google** (or email/password); the session stays active in this
browser until you sign out. Drafts still autosave to localStorage, and signing
in enables cloud save (20 MB cap) plus **Publish link**, which uploads the
itinerary JSON and gives you a URL to paste into the Tripenerary app.

## The five editor tabs

| Tab | What it holds |
| --- | --- |
| **Days** | The day strip, plus the day being edited: date, base city, title, summary, stay link, hero image, schedule blocks, notes. |
| **Trip** | Trip master settings: title, dates, timezone, currency, travellers, cover image, travel documents, and the progress panel. |
| **Stays** | Hotels and resorts. Each needs an **id**, which days reference. |
| **Info** | Emergency contacts & embassy locations, practical sections, and useful contacts. |
| **Checks** | Errors and warnings, run before exporting. |

## Account, save status, and publishing

1. Create a Firebase project; enable **Google** and Email/Password auth, Firestore, and Storage.
2. Authorize the builder domain under Authentication → Settings → Authorized domains.
3. Deploy `firestore.rules` and `storage.rules` from the repo root.
4. Copy `builder/.env.example` to `builder/.env.local` and fill in the web app config.
5. Open the builder, sign in on `/login` (Google recommended). The toolbar subtitle
   shows save status (`Saving…`, `Saved · 1.2 KB / 20 MB`).
6. **Publish link** uploads the exported JSON to Storage and shows a shareable URL.
   Paste that URL into the mobile app's **Add trip** sheet.

Prerelease / over-limit drafts stay local; cloud save refuses uploads above 20 MB.

## Days and blocks

A day is a date plus an ordered list of blocks. Add a block, pick its type
(sight, food, travel, flight, hotel, activity, rest, note), give it a time and a
title. Everything else is optional.

Blocks reorder with the arrow buttons and collapse to a one-line summary once
titled, so a twelve-block day stays readable.

**Duplicate** copies a whole day forward by one date, which is the fastest way to
build a trip with a repeating shape.

## Coordinates

Latitude and longitude drive two things: the small map under a block, and the
day route line at the bottom of the day. Paste a Google Maps URL into the
Location panel's *Google Maps URL* field and the coordinates are lifted out of it
automatically. A block without coordinates still works, it just does not appear
on the map.

The route starts at the day's stay, walks the pinned blocks in order, then closes
back to the stay with a dashed line, which is why an out-and-back day reads as a
perimeter.

## Trip master

*Match days to the date range* rebuilds `days[]` so there is exactly one day per
date between the start and end dates. Days that already exist keep everything on
them; missing dates get blank days. Use it after changing the trip length.

The progress panel counts a day as **planned** once it has a title and at least
one block.

## Export

**Export JSON** downloads a file named after the trip title. Empty fields are
stripped, so the result reads like the hand-written samples rather than a form
dump.

Verify it against the schema before shipping:

```bash
node ../scripts/validate-itinerary.mjs ~/Downloads/your-trip.json
node ../scripts/validate-itinerary.mjs ~/Downloads/your-trip.json --check-images
```

## PDF

Two buttons produce a printable A4 page per day, sized for sharing or printing:

- **Download PDF** on the day being edited — that day alone.
- **PDF · all days** in the header — every day, one page each, in one file.

A page carries the trip banner, the day title, date and summary, the schedule with
times in the left margin, the stay, the notes and the route line. Long days
continue onto a second page; the footer numbers them.

The text is real text, so it stays sharp and is searchable. Hero images are
fetched from their URL when you click, and are skipped without complaint if the
host blocks browser requests. Emoji and non-Latin scripts are dropped, because the
built-in PDF fonts cannot draw them.

## Import

**Import JSON** opens a dialog that takes an existing itinerary three ways:

- **From a file** — drag a `.json` file onto the drop zone, or browse for it.
- **Paste JSON** — paste the text straight in. It parses as you type and shows a
  summary of what it found.
- **From a URL** — fetch a hosted itinerary. Some hosts block browser fetches with
  CORS; if that happens, download the file and use the file tab.

Then choose how it lands:

| Mode | Effect |
| --- | --- |
| **Replace everything** | The file becomes the whole trip. |
| **Add to this trip** | Its days merge into the current trip sorted by date. Stays, info sections, and contacts are added only where they do not already exist. |
| **Days only** | Keep the current trip settings and take just the days. |

Everything imported gets fresh internal ids, so merging a file into itself never
collides. Anything you import is a normal draft from then on: edit it in the
forms, autosaved like anything else.

Import and export round-trip without losing data: single-image arrays collapse to
one object and empty strings are dropped, both of which the app normalises back.

## Editing the raw JSON

The **JSON** preview tab has an **Edit** button. It turns the pane into a text
editor over the live export, and **Apply** parses what you wrote back into the
forms. Useful for bulk changes that would be tedious to click through, like
find-and-replace across image URLs. A parse error shows in a red bar and nothing
is applied until it is valid.

## Preview tabs

- **Day** — the day screen, including the date strip. Tapping a date there changes
  the day you are editing.
- **Info** — the trip info screen with document sections and contacts.
- **JSON** — the live export, with a copy button.
