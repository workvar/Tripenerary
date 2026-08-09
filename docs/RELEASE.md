# Publishing Tripenerary

## Galaxy Store

See the Galaxy Store checklist below (signing, Maps key, screenshots, review rules).

## Google Play Store (GitHub Actions)

Pushing a version tag (`v1.2.3`) runs `.github/workflows/release.yml`:

1. Typechecks the builder and the app.
2. Builds a signed **APK** and **AAB**.
3. Attaches both to a GitHub Release.
4. When Play publishing is enabled, uploads the AAB to Google Play.

Prerelease tags (`v1.2.3-beta`) still create a GitHub Release but **do not** publish to Play.

### One-time Play Console setup

1. Create the app in [Google Play Console](https://play.google.com/console) with
   package `com.workvar.tripenerary`.
2. Complete the store listing, content rating, and Data safety form (see
   `docs/PRIVACY.md`).
3. In Google Cloud, create a service account and download its JSON key. Enable the
   **Google Play Android Developer API** on that Cloud project
   (`androidpublisher.googleapis.com`).
4. In Play Console → **Users and permissions** → **Invite new users**, add the
   service account email (`…@….iam.gserviceaccount.com`). Grant app access for
   `com.workvar.tripenerary` with permission to **view app information** and
   **manage releases on testing tracks** (or Admin / Release Manager).
5. Wait a few minutes after inviting — Play permission changes are not always
   instant. Upload one AAB manually once if the API still returns “Package not
   found”.

If GitHub Actions fails with **The caller does not have permission**, the JSON
secret is fine but steps 3–4 above are incomplete (API not enabled, or the
service account is not linked in Play Console Users and permissions).

### Repository secrets and variables

| Name | Type | Purpose |
|---|---|---|
| `ANDROID_KEYSTORE_BASE64` | secret | Base64 of `android/app/release.keystore` (`base64 -w0 release.keystore`) |
| `TRIPENERARY_UPLOAD_STORE_PASSWORD` | secret | Keystore password |
| `TRIPENERARY_UPLOAD_KEY_ALIAS` | secret | Usually `upload` |
| `TRIPENERARY_UPLOAD_KEY_PASSWORD` | secret | Key password (often same as store) |
| `GOOGLE_MAPS_ANDROID_KEY` | secret | Maps SDK key restricted to the upload SHA-1 |
| `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` | secret | Full JSON of the Play service account |
| `EXPO_PUBLIC_FIREBASE_*` | secrets | Firebase web config including `MEASUREMENT_ID` (see `.env.example`) |
| `PLAY_STORE_ENABLED` | variable | Optional. Set to `false` to skip Play upload; otherwise the job runs for non-prerelease tags |
| `PLAY_STORE_TRACK` | variable | Optional. `internal` (default), `alpha`, `beta`, or `production` |
| `PLAY_STORE_STATUS` | variable | Optional. `draft` (default), `completed`, `inProgress`, or `halted`. Draft apps can only receive `draft` releases |
| `PLAY_STORE_ENVIRONMENT` | variable | Optional. GitHub Actions environment name that holds the secrets (default `Production`) |

Store `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`, the upload keystore secrets, and Firebase
keys as **Environment secrets** on that GitHub Environment (Settings → Secrets →
Actions → Environment secrets), or as repository secrets. The release jobs select
the environment so Environment secrets are visible to the workflow.

Per-tag GitHub Release notes live in `store/releases/vX.Y.Z.md` (same format as
Highlights / Added / Changed / Downloads / Upgrade notes). Play “what's new”
files live in `store/whatsnew/whatsnew-<LOCALE>` (e.g. `whatsnew-en-US`).

To re-upload an existing release AAB without rebuilding, run the
**Publish Play Store AAB** workflow (`workflow_dispatch`) with the tag name.

### Versioning

Tag `vMAJOR.MINOR.PATCH`. The workflow sets:

- `versionName` → the tag without the leading `v`
- `versionCode` → `MAJOR * 10000 + MINOR * 100 + PATCH`

`versionCode` must always increase for Play uploads.

```bash
git tag v1.0.1
git push origin v1.0.1
```

---

# Releasing Tripenerary to the Galaxy Store

## 0. One-time setup

### Play Console

1. Create a [Google Play Developer account](https://play.google.com/console/)
   (one-time registration fee).
2. Create the app: **Create app** → name `Tripenerary`, default language English,
   app type **App**, free or paid.
3. Complete the dashboard checklist items that block the first release
   (privacy policy, Data safety, content rating, target audience, store listing).
   Copy for those forms lives in `store/LISTING.md` and `store/DATA_SAFETY.md`.
   Host `docs/PRIVACY.md` at a public HTTPS URL first.

### Google Maps key

The Android Maps key is injected into `AndroidManifest.xml` at build time by
`android/app/secrets.gradle`. It is never committed.

1. Google Cloud Console → APIs & Services → Library → enable **Maps SDK for Android**.
2. Credentials → create an API key.
3. Restrict it: **Application restrictions → Android apps**, then add one entry per
   signing certificate that will ever produce a build:

   | Package name | SHA-1 |
   |---|---|
   | `com.workvar.tripenerary` | debug keystore SHA-1 |
   | `com.workvar.tripenerary` | upload keystore SHA-1 |
   | `com.workvar.tripenerary` | Play App Signing key SHA-1 (see below) |

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

### Firebase (optional, for account sync)

1. Create a Firebase project and a Web app; copy the config into `.env` using the
   `EXPO_PUBLIC_FIREBASE_*` names in `.env.example`.
2. Authentication → Sign-in method → enable **Email/Password**.
3. Firestore → create a database, then deploy `firestore.rules`:
   `firebase deploy --only firestore:rules`
4. Without these keys the app still works offline; Settings shows that cloud sync
   is not configured.

### Release keystore

Already generated at `android/app/release.keystore` (RSA 4096, alias `upload`,
valid until 2056). Its passwords are in `.env`.

**Back both up now.** They are gitignored by design. If you lose either, you can
never publish an update to the same Galaxy Store listing; you would have to ship
under a new package name and lose every existing install.

Somewhere durable means a password manager plus one offline copy, not just this
laptop.

Generate once and keep forever:

```bash
keytool -genkeypair -v -keystore android/app/release.keystore \
  -alias upload -keyalg RSA -keysize 4096 -validity 10950 \
  -dname "CN=Tripenerary, OU=Mobile, O=Tripenerary, L=Unknown, ST=Unknown, C=US"
```

Put the passwords in `.env` (see `.env.example`). The keystore and passwords are
gitignored by design.

**Back both up now.** A password manager plus one offline copy. If you lose either,
you can never publish an update to the same Play listing unless you already enrolled
in Play App Signing and can reset the upload key through Play Console support.

### Play App Signing

Play Console signs the APKs users install. You upload an AAB signed with your
**upload key**; Google re-signs with the **app signing key**.

1. First upload: accept Play App Signing (recommended / default).
2. After enrollment, open **Setup → App signing** and copy the **App signing key
   certificate** SHA-1.
3. Add that SHA-1 to the Google Maps Android key restrictions. Without it, maps
   work in local release builds but fail for every Play install.

## 1. Pre-build checks

```bash
npm run check       # typecheck + itinerary schema validation
npm run preflight   # release config: maps key, signing, icons, permissions
```

`preflight` exits non-zero on anything that would ship broken, and prints the
upload-key SHA-1 you need for the Maps key restriction.

## 2. Build the Play upload (AAB)

Bump the version first. `versionCode` must strictly increase on every upload,
including rejected resubmissions. Keep `app.json` `expo.version` /
`android.versionCode` in sync with what you pass to Gradle.

```bash
# override on the command line without editing files:
cd android && ./gradlew bundleRelease \
  -Ptripenerary.versionCode=2 \
  -Ptripenerary.versionName=1.0.1
```

Or via npm, using the values already in `android/app/build.gradle`:

```bash
npm run build:aab   # android/app/build/outputs/bundle/release/app-release.aab
npm run build:apk   # sideload smoke-test only; Play expects the AAB
```

Release builds run R8 with `android/app/proguard-rules.pro`. **Always smoke-test
the release APK, not just debug** — minification is a common cause of a blank map,
and it only shows up in release.

```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

Tagged pushes also build a signed AAB via `.github/workflows/release.yml` using the
committed `android/` tree (no `expo prebuild --clean` — that wiped the upload
keystore and custom signing scripts). The job fails if the bundle is still
debug-signed. Required secrets (Production environment):

| Secret | Value |
|---|---|
| `GOOGLE_MAPS_ANDROID_KEY` | restricted Android Maps key |
| `ANDROID_KEYSTORE_BASE64` | `base64 -w0 android/app/release.keystore` |
| `TRIPENERARY_UPLOAD_STORE_PASSWORD` | keystore password |
| `TRIPENERARY_UPLOAD_KEY_ALIAS` | usually `upload` |
| `TRIPENERARY_UPLOAD_KEY_PASSWORD` | key password (often same as store) |

```bash
git tag v1.0.0 && git push origin v1.0.0
```

## 3. Play Console submission

Open the app in [Play Console](https://play.google.com/console/).

### Technical requirements (already met by this project)

| Requirement | This project |
|---|---|
| Upload format | AAB (`bundleRelease`) |
| Target API | 36 (Android 16) — required for new apps/updates from 31 Aug 2026 |
| 64-bit | ships `arm64-v8a` (and `armeabi-v7a`) |
| Permissions | `INTERNET`, `ACCESS_NETWORK_STATE` only |
| Package | `com.workvar.tripenerary` |

### Store listing

See `store/LISTING.md` for title, short description, full description, and graphic
checklist. Upload:

| Asset | File / size |
|---|---|
| App icon | `store/icon-512.png` (512 × 512) |
| Feature graphic | `store/feature-graphic.png` (1024 × 500) |
| Phone screenshots | at least 2; see listing doc |

### Data safety

Fill the questionnaire from `store/DATA_SAFETY.md`. Short version: no collected
data, no sharing, everything stays on device.

### Content rating

Tripenerary stores itineraries on-device and, when you sign in, syncs trips and
display preferences to Firebase (Firestore) under your account. Declare:

- Account info (email) when the user signs in.
- App activity / user-generated content: itinerary URLs and cached trip JSON the
  user chose to sync.
- Shared with third parties: Google Firebase (processing), Google Maps (map tiles).
- Note that the app also makes network requests to the itinerary URL the user
  supplies and to image/document hosts referenced by that itinerary.

A public HTTPS URL is required. Host `docs/PRIVACY.md` (GitHub Pages, a gist raw
URL behind a static host, or any site you control) and paste the URL into both the
store listing and the App content → Privacy policy field.

If Firebase is enabled, provide a test account email/password for reviewers.
Also include a note: "The app requires an itinerary JSON URL to show content. A
working sample is at <URL>." Reviewers who open an empty app tend to fail it
under 1.2.1.

The app has no login, so no test account is needed. Include a note for reviewers:

> The app needs an itinerary JSON URL to show content. Paste this sample:
> `<PUBLIC_SAMPLE_URL>`. Or open the build with `DEFAULT_SOURCE_URL` set so a trip
> is already loaded.

Reviewers who open an empty library tend to reject under "incomplete / broken".
Set `DEFAULT_SOURCE_URL` in `src/config.ts` before the first store build, or give
them a working public JSON URL in the review notes.

## 4. Policy and QA checklist before you press Submit

- [ ] Release APK smoke-tested on a real phone (open trip, map preview, document,
      offline airplane mode).
- [ ] Maps key restricted to upload SHA-1 **and** Play App Signing SHA-1.
- [ ] Privacy policy URL loads without auth.
- [ ] Data safety form matches `store/DATA_SAFETY.md`.
- [ ] Screenshots show real UI (no mockups, no copyrighted stock you do not have
      rights to). Prefer a sample trip with public-domain / CC0 images, or turn
      images off in Settings before capturing.
- [ ] `versionCode` increased since the last upload.
- [ ] Support email set in Play Console and in the privacy policy.

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

Do **not** run `npx expo prebuild --clean` before a store build. The committed
`android/` tree carries signing, Maps injection, splash, and permission trimming
that a clean prebuild would wipe.

## 6. Post-launch

- Use a **closed testing** track first, then **open testing**, then production
  with a staged rollout (e.g. 20% → 50% → 100%).
- Bump `versionCode` on every single upload.
- After the first production release, confirm maps still render on a Play install
  (this is the Play App Signing SHA-1 check in disguise).
