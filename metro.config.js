const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Firebase ships dual ESM/CJS builds. Disabling package exports keeps Metro on
// the React Native entry (`@firebase/auth` → dist/rn), which includes
// getReactNativePersistence.
config.resolver.sourceExts.push('cjs');
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
