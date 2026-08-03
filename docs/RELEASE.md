# Releasing Tripenerary to the Galaxy Store

## 0. One-time setup

### Google Maps key

The Android Maps key is injected into `AndroidManifest.xml` at build time by
`android/app/secrets.gradle`. It is never committed.

1. Google Cloud Console → APIs & Services → Library → enable **Maps SDK for Android**.
2. Credentials → create an API key.
3. Restrict it: **Application restrictions → Android apps**, then add one entry per
   signing certificate that will ever produce a build:

   | Package name | SHA-1 |
   |---|---|
   | `com.tripcompanion.app` | debug keystore SHA-1 |
   | `com.tripcompanion.app` | release keystore SHA-1 |
   | `com.tripcompanion.app` | Galaxy Store signing SHA-1 (see step 3 below) |

   Print a keystore's SHA-1 with:

   ```bash
   keytool -list -v -keystore android/app/release.keystore -alias upload
   keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android
   ```

4. **API restrictions → Restrict key → Maps SDK for Android.**
5. Put the key in `.env` as `GOOGLE_MAPS_ANDROID_KEY`.

> A key that is missing, restricted to the wrong SHA-1, or restricted to the wrong
> package renders the map as a blank grey canvas with no error dialog. Tapping the
> map still works because that fires an intent to the Google Maps app, which does
> not use your key at all. That symptom is always a key problem, never a layout one.

### Release keystore

Already generated at `android/app/release.keystore` (RSA 4096, alias `upload`,
valid until 2056). Its passwords are in `.env`.

**Back both up now.** They are gitignored by design. If you lose either, you can
never publish an update to the same Galaxy Store listing; you would have to ship
under a new package name and lose every existing install.

Somewhere durable means a password manager plus one offline copy, not just this
laptop.

To regenerate from scratch:

```bash
keytool -genkeypair -v -keystore android/app/release.keystore \
  -alias upload -keyalg RSA -keysize 4096 -validity 10950
```

## 1. Pre-build checks

```bash
npm run check       # typecheck + itinerary schema validation
npm run preflight   # release config: maps key, signing, icons, permissions
```

`preflight` exits non-zero on anything that would ship broken, and prints the
release SHA-1 you need for the Maps key restriction.

## 2. Build

Bump the version first. `versionCode` must strictly increase on every upload.

```bash
# in android/app/build.gradle defaultConfig, or pass on the command line:
cd android && ./gradlew bundleRelease -Ptripenerary.versionCode=2 -Ptripenerary.versionName=1.0.1
```

Or via npm, using the values in `build.gradle`:

```bash
npm run build:aab   # android/app/build/outputs/bundle/release/app-release.aab
npm run build:apk   # android/app/build/outputs/apk/release/app-release.apk
```

Release builds now run R8 with `android/app/proguard-rules.pro`. **Always smoke
test the release build, not just debug** — minification is the other common cause
of a blank map, and it only manifests in release.

```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

## 3. Galaxy Store submission

Seller Portal: <https://seller.samsungapps.com/>. You need a Samsung account and
commercial seller status before you can register an app.

### Binary tab

- Galaxy Store requires **target API level ≥ 33** and at least one **64-bit**
  binary. This project targets API 36 and ships `arm64-v8a`, so both pass.
- If you upload an **AAB**, Galaxy Store manages the signing key: you either
  upload your own key or let Samsung use theirs. If Samsung signs, the delivered
  APK has a **different SHA-1** than your keystore, and your Maps key restriction
  will reject it. Get that SHA-1 from Seller Portal and add it to the Google Cloud
  key restrictions before publishing, or upload an **APK** signed with your own
  key to keep the fingerprint you already know.
- No Play Asset Delivery or Play Feature Delivery support. Not used here.

### App Information tab

| Field | Value |
|---|---|
| App title | Tripenerary |
| Package | `com.tripcompanion.app` |
| Category | Travel |
| Default language | English (required when publishing to 2+ countries) |
| Icon | `store/icon-512.png` |
| Screenshots | see below |
| Privacy policy URL | required, see `docs/PRIVACY.md` |
| Support email | required |

### Screenshots

Capture on a real Galaxy device or Samsung's [Remote Test
Lab](https://developer.samsung.com/remote-test-lab). Suggested set: landing
library, an open trip day view, the map preview, day picker, settings.

Two review rules bite here:

- **1.3.3** screenshots must accurately show actual app functionality. No mockups,
  no marketing frames with invented UI.
- **3.2.6** you may not use copyrighted imagery without permission. The app pulls
  remote photos (Wikimedia and similar) into itinerary cards. Use a sample trip
  whose images are public domain or CC0 for the screenshots, or screenshot with
  images turned off in Settings.

### Data Safety tab

Tripenerary stores everything locally via AsyncStorage and sends no analytics.
Declare accordingly:

- Collected: none.
- Shared with third parties: none.
- Note that the app makes network requests to (a) the itinerary URL the user
  supplies, (b) Google Maps, (c) image hosts referenced by the itinerary. Those
  hosts see the device IP as a normal consequence of fetching.

### Review tab

The app has no login, so no test account is needed. Do include a note: "The app
requires an itinerary JSON URL to show content. A working sample is at
<URL>." Reviewers who open an empty app tend to fail it under 1.2.1.

Add a publicly reachable sample itinerary URL before submitting, or set
`DEFAULT_SOURCE_URL` in `src/config.ts` so the app ships with one trip already
loaded.

## 4. Review rules worth re-reading before you submit

From the [App Distribution Guide](https://developer.samsung.com/galaxy-store/distribution-guide.html):

- **1.2.4** app graphics must be visible — a blank map is a straight fail.
- **1.2.5** text must not be truncated or distorted.
- **1.2.6** screens must fill the display — check on a foldable and a tall 21:9 device.
- **1.4.6** must not crash on rotation or when accessories are plugged in.
- **3.1.6** must not request more permissions than the features need. The manifest
  is now down to `INTERNET` and `ACCESS_NETWORK_STATE`; keep it that way.

## 5. Troubleshooting the build

Gradle's configuration-phase errors are often one line with no location. Get the
real cause first:

```bash
cd android && ./gradlew help --stacktrace
```

`help` configures every project without compiling anything, so it fails fast on
config errors and the stacktrace names the exact script and line.

To check whether the custom config is at fault, comment out these two lines in
`android/app/build.gradle` and re-run. If the failure persists, it is not them:

```groovy
apply from: "secrets.gradle"
apply from: "signing.gradle"
```

With `secrets.gradle` disabled you also need to stub the key, since
`build.gradle` reads it:

```groovy
String googleMapsApiKey = ''
```

Other things worth trying, in order of cheapness:

```bash
cd android && ./gradlew clean
./gradlew --stop           # kill a stale daemon holding old script classes
rm -rf ~/.gradle/caches/*/scripts ~/.gradle/caches/*/scripts-remapped
```

## 6. Post-launch

- Staged rollout is available on the Publication tab. Use it for the first release.
- Bump `versionCode` on every single upload, including rejected resubmissions.
