# Privacy Policy — Tripenerary

**Draft.** Host this at a public URL and enter that URL in the Galaxy Store Seller
Portal and Google Play Console. Review it against the app's actual behaviour before
publishing, and have a lawyer look at it if you are distributing commercially. This
is not legal advice.

Last updated: _[date]_

## What this app does

Tripenerary displays a travel itinerary that you supply as a URL. It keeps a copy
of that itinerary on your device so it works offline. If you create an account and
sign in, your trip list and display preferences also sync to the cloud so they are
available on other devices.

## Data we collect

When you use the app without signing in, Tripenerary does not collect personal data
on our servers.

When you create an account or sign in, we process:

- **Account credentials** — email address and password (password is handled by
  Firebase Authentication; we do not store plaintext passwords).
- **Synced library data** — itinerary URLs you add, cached itinerary contents, and
  display preferences (map previews, images, auto-refresh).

There is no advertising SDK and no separate analytics product beyond what Firebase
may log as part of Authentication and Firestore operation.

## Data stored on your device

The following is stored locally on your device using Android's app-private storage,
and is deleted when you uninstall the app:

- The itinerary URLs you add.
- A cached copy of each itinerary's contents.
- Copies of any attached documents you have opened, such as tickets and booking
  confirmations, so they still open without a connection. You can delete these at
  any time from Settings, under Documents.
- Your display preferences (map previews, images, auto-refresh).
- A Firebase Auth session token when you are signed in.

## Network requests

The app makes requests to these kinds of destinations:

1. **The itinerary URL you supply.** The operator of that URL can see your device's
   IP address and the time of the request, as with any web request.
2. **Google Maps**, to render map previews. Governed by
   [Google's Privacy Policy](https://policies.google.com/privacy).
3. **Google Firebase** (Authentication and Cloud Firestore), when you sign in, to
   authenticate you and sync your trips and preferences. Governed by
   [Google's Privacy Policy](https://policies.google.com/privacy) and the
   [Firebase Data Processing terms](https://firebase.google.com/terms/data-processing-terms).
4. **Image hosts referenced inside your itinerary**, to display photos. These are
   whichever hosts your itinerary points at.
5. **Hosts of documents attached to your itinerary**, to download a document you have
   tapped, and afterwards to check whether that document has changed. The app never
   downloads an attached document you have not opened.

We do not control and cannot see what third-party itinerary, image, or document
hosts log.

## Data sharing

Synced account data is stored in Google Firebase on your behalf. We do not sell your
data. We do not share it with advertisers.

## Data retention and deletion

- On-device data: remove a trip in the app to delete its cached copy, clear downloads
  in Settings, or uninstall the app to delete everything local.
- Cloud data: sign in and use **Clear all saved data** in Settings to wipe the synced
  library for your account, or contact us to request account deletion. Signing out
  leaves local data on the phone and leaves the cloud copy until you clear it.

## Your rights

Depending on where you live, you may have rights to access, correct, or delete
personal data associated with your account. Contact us using the email below. You
can also delete synced trips from inside the app while signed in.

## Children

Tripenerary is not directed at children under 13 and does not knowingly collect data
from children.

## Changes to this policy

If this policy changes, the updated version will be posted at this URL with a new
"last updated" date, and the change will be noted in the app's store release notes.

## Contact

_[your support email]_
