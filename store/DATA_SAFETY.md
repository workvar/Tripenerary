# Google Play Data safety — Tripenerary

Answers for Play Console → App content → Data safety.
Match these to the live app before submitting; if behaviour changes, update both
this file and `docs/PRIVACY.md`.

## Overview questions

| Question | Answer |
|---|---|
| Does your app collect or share any of the required user data types? | **No** |
| Is all of the user data collected by your app encrypted in transit? | N/A (nothing collected) |
| Do you provide a way for users to request that their data is deleted? | N/A — all data is on-device; uninstall or remove a trip deletes it |

Play's "collect" means data transmitted off the device to you or a third party
*you* control. Tripenerary has no backend and no SDKs that phone home. Network
requests the user triggers (itinerary URL, image hosts, document hosts, Google
Maps tiles) are not "collected by the app" in the Play sense when you do not
receive them.

## Data types

Declare **no** data collected and **no** data shared for every category:

- Location
- Personal info
- Financial info
- Health and fitness
- Messages
- Photos and videos
- Audio files
- Files and docs
- Calendar
- Contacts
- App activity
- Web browsing
- App info and performance
- Device or other IDs

## Third-party activity (notes for the form / review)

These happen on the device as ordinary HTTPS fetches. They are **not** listed as
collected data above because the developer never receives them. Mention them in
the privacy policy (already covered in `docs/PRIVACY.md`):

1. User-supplied itinerary URL — operator sees IP / request metadata.
2. Google Maps SDK — map previews; Google's privacy policy applies.
3. Image and document hosts referenced inside the itinerary.

If Play Console phrasing forces a choice about the Maps SDK seeing approximate
location/IP as part of tile requests, prefer the interpretation that you do not
collect or share user data yourself, and keep the privacy policy accurate about
third-party requests.

## Security practices

| Practice | Answer |
|---|---|
| Data encrypted in transit | N/A / Yes for HTTPS requests the app makes |
| Users can request deletion | Yes — remove trip in-app, or uninstall |
| Independent security review | No |
| Committed to Play Families Policy | No (not directed at children) |

## Ads and account creation

| Question | Answer |
|---|---|
| Does your app contain ads? | No |
| Does your app use essential cookies / similar? | No |
| Account creation | No accounts |
