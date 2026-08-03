import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Dynamic config layered on top of app.json.
 *
 * Map keys are read from the environment so they never land in git. Expo loads
 * `.env` automatically before evaluating this file; EAS builds read the same
 * names from EAS environment variables.
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
