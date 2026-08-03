import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Dynamic config layered on top of app.json.
 *
 * Map keys are read from the environment so they never land in git. Expo loads
 * `.env` automatically before evaluating this file; EAS builds read the same
 * names from EAS environment variables.
 *
 * Note on Android: the `android/` directory is committed, so Gradle reads
 * `android/app/src/main/AndroidManifest.xml` directly and the Android values
 * below only apply when you re-run `expo prebuild`. The Android Maps key is
 * injected at build time by `android/app/secrets.gradle`; it is repeated here so
 * a prebuild reproduces the same manifest instead of silently dropping the key.
 * iOS is still fully generated, so the iOS key below is the only source.
 */
const ANDROID_MAPS_KEY = process.env['GOOGLE_MAPS_ANDROID_KEY'] ?? '';
const IOS_MAPS_KEY = process.env['GOOGLE_MAPS_IOS_KEY'] ?? '';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? 'Tripenerary',
  slug: config.slug ?? 'trip-companion',
  android: {
    ...config.android,
    config: { googleMaps: { apiKey: ANDROID_MAPS_KEY } },
  },
  ios: {
    ...config.ios,
    config: { googleMapsApiKey: IOS_MAPS_KEY },
  },
});
