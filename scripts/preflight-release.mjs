#!/usr/bin/env node
/**
 * Refuses to let a broken release build reach Google Play.
 *
 *   node scripts/preflight-release.mjs
 *
 * Checks the things that fail silently at runtime rather than at build time:
 * a missing Maps key, a debug-signed release, placeholder / wrong-size Play
 * listing graphics, and permissions the listing does not justify.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ANDROID_APP = join(ROOT, 'android', 'app');

const failures = [];
const warnings = [];

const fail = (msg) => failures.push(msg);
const warn = (msg) => warnings.push(msg);

/** Parse a KEY=value file into an object. Missing file yields {}. */
function readEnvFile(path) {
  if (!existsSync(path)) return {};
  const out = {};
  for (const raw of readFileSync(path, 'utf8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const i = line.indexOf('=');
    out[line.slice(0, i).trim()] = line
      .slice(i + 1)
      .trim()
      .replace(/^["'](.*)["']$/, '$1');
  }
  return out;
}

const env = { ...readEnvFile(join(ROOT, '.env')), ...process.env };

// --- Maps --------------------------------------------------------------------
const mapsKey = env.GOOGLE_MAPS_ANDROID_KEY ?? '';
if (!mapsKey) {
  fail('GOOGLE_MAPS_ANDROID_KEY is not set. Maps will render as a blank grey canvas.');
} else if (mapsKey.startsWith('REPLACE') || mapsKey.length < 30) {
  fail(`GOOGLE_MAPS_ANDROID_KEY does not look like a real key: "${mapsKey.slice(0, 12)}..."`);
}

const manifest = readFileSync(join(ANDROID_APP, 'src', 'main', 'AndroidManifest.xml'), 'utf8');
if (manifest.includes('REPLACE_WITH')) {
  fail('AndroidManifest.xml still contains a REPLACE_WITH placeholder.');
}
if (!manifest.includes('${GOOGLE_MAPS_API_KEY}')) {
  fail('AndroidManifest.xml no longer uses the ${GOOGLE_MAPS_API_KEY} placeholder.');
}
for (const perm of ['SYSTEM_ALERT_WINDOW', 'WRITE_EXTERNAL_STORAGE', 'READ_EXTERNAL_STORAGE']) {
  const re = new RegExp(`<uses-permission[^>]*${perm}(?![^>]*tools:node="remove")`);
  if (re.test(manifest)) fail(`AndroidManifest.xml requests ${perm} without justification.`);
}

// --- Signing -----------------------------------------------------------------
const storeFile = env.TRIPENERARY_UPLOAD_STORE_FILE ?? 'release.keystore';
const keystorePath = resolve(ANDROID_APP, storeFile);
if (!existsSync(keystorePath)) {
  fail(`Release keystore missing at ${keystorePath}. The build would be debug-signed.`);
} else if (!env.TRIPENERARY_UPLOAD_STORE_PASSWORD) {
  fail('TRIPENERARY_UPLOAD_STORE_PASSWORD is not set.');
} else {
  try {
    const out = execFileSync(
      'keytool',
      ['-list', '-v', '-keystore', keystorePath, '-storepass', env.TRIPENERARY_UPLOAD_STORE_PASSWORD],
      { encoding: 'utf8' },
    );
    const sha1 = out.match(/SHA1:\s*([0-9A-F:]+)/)?.[1];
    if (sha1) {
      console.log(`  release SHA-1: ${sha1}`);
      console.log('  (this must be allow-listed on the Google Maps Android key)');
    }
    const until = out.match(/until:\s*(.+)/)?.[1]?.trim();
    if (until && new Date(until) < new Date(Date.now() + 25 * 365 * 864e5)) {
      warn(`Signing certificate expires ${until}. Stores want at least 25 years of validity.`);
    }
  } catch {
    fail('Could not open the release keystore. Check the store password.');
  }
}

// --- Icons / Play listing graphics ------------------------------------------
const requiredAssets = [
  'assets/icon.png',
  'assets/adaptive-icon.png',
  'assets/splash-icon.png',
  'store/icon-512.png',
  'store/feature-graphic.png',
  'android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml',
  'android/app/src/main/res/drawable-xxxhdpi/ic_launcher_foreground.png',
  'android/app/src/main/res/drawable-xxxhdpi/splash_icon.png',
];
for (const rel of requiredAssets) {
  if (!existsSync(join(ROOT, rel))) fail(`Missing icon asset: ${rel}. Run scripts/generate-icons.py.`);
}

const featureGraphic = join(ROOT, 'store', 'feature-graphic.png');
if (existsSync(featureGraphic)) {
  // PNG IHDR: width/height are big-endian u32 at bytes 16 and 20.
  const buf = readFileSync(featureGraphic);
  if (buf.length >= 24 && buf.toString('ascii', 1, 4) === 'PNG') {
    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);
    if (width !== 1024 || height !== 500) {
      fail(`store/feature-graphic.png must be 1024×500 (Play requirement); got ${width}×${height}.`);
    }
  }
}

for (const rel of ['store/LISTING.md', 'store/DATA_SAFETY.md', 'docs/PRIVACY.md', 'docs/RELEASE.md']) {
  if (!existsSync(join(ROOT, rel))) fail(`Missing store/release doc: ${rel}.`);
}

// --- Build flags -------------------------------------------------------------
const gradleProps = readFileSync(join(ROOT, 'android', 'gradle.properties'), 'utf8');
if (!/android\.enableMinifyInReleaseBuilds\s*=\s*true/.test(gradleProps)) {
  warn('Minification is off. The AAB will be larger than it needs to be.');
}
if (/^reactNativeArchitectures=.*x86/m.test(gradleProps)) {
  warn('x86 ABIs are still enabled. They are emulator-only and inflate the AAB.');
}
if (!/armeabi-v7a|arm64-v8a/.test(gradleProps)) {
  warn('No ARM ABIs configured in reactNativeArchitectures. Play devices need arm64-v8a.');
}

const appJson = JSON.parse(readFileSync(join(ROOT, 'app.json'), 'utf8'));
const androidPkg = appJson?.expo?.android?.package;
if (androidPkg !== 'com.tripcompanion.app') {
  fail(`app.json android.package is "${androidPkg}", expected com.tripcompanion.app.`);
}
if (!appJson?.expo?.android?.versionCode) {
  warn('app.json android.versionCode is missing; Gradle defaults to 1.');
}

if (!readFileSync(join(ROOT, 'src', 'config.ts'), 'utf8').match(/DEFAULT_SOURCE_URL\s*=\s*'https?:\/\//)) {
  warn('DEFAULT_SOURCE_URL is empty. Play reviewers opening an empty library often reject the app — set one or put a sample URL in the review notes.');
}

// --- Report ------------------------------------------------------------------
for (const w of warnings) console.warn(`  warn  ${w}`);
for (const f of failures) console.error(`  FAIL  ${f}`);

if (failures.length > 0) {
  console.error(`\n${failures.length} blocking issue(s). Not ready to ship.`);
  process.exit(1);
}
console.log(`\nRelease preflight passed${warnings.length ? ` with ${warnings.length} warning(s)` : ''}.`);
