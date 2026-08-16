#!/usr/bin/env node
/**
 * Capture Play Store screenshots from a running emulator or device over adb.
 *
 *   node scripts/capture-screenshots.mjs phone
 *   node scripts/capture-screenshots.mjs tablet7 --serial emulator-5556
 *
 * Captures land in store/screenshots/<profile>/NN-<name>.png. Run
 * `python3 scripts/fit-screenshots.py` afterwards to normalise them to the
 * exact dimensions Play accepts.
 *
 * The script does not drive the UI. It prompts for each shot so you can put the
 * app on the right screen, then presses Enter. That keeps every image a genuine
 * capture, which is what the Play preview-asset policy requires.
 */

import { execFileSync } from 'node:child_process';
import { mkdirSync, existsSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { PROFILES, SHOTS } from './screenshot-profiles.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_ROOT = path.join(ROOT, 'store', 'screenshots');

const args = process.argv.slice(2);
const profileName = args.find((a) => !a.startsWith('--')) ?? 'phone';
const serialIdx = args.indexOf('--serial');
const serial = serialIdx === -1 ? null : args[serialIdx + 1];
const skipDemoMode = args.includes('--no-demo-mode');

const profile = PROFILES[profileName];
if (!profile) {
  console.error(`Unknown profile "${profileName}".`);
  console.error(`Available: ${Object.keys(PROFILES).join(', ')}`);
  process.exit(1);
}

const adb = (...cmd) =>
  execFileSync('adb', serial ? ['-s', serial, ...cmd] : cmd, {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });

function requireDevice() {
  let out;
  try {
    out = adb('devices');
  } catch {
    console.error('adb not found. Install Android platform-tools and put adb on PATH.');
    process.exit(1);
  }
  const devices = out
    .split('\n')
    .slice(1)
    .map((l) => l.trim())
    .filter((l) => l.endsWith('device'));
  if (devices.length === 0) {
    console.error('No device or emulator attached. Start one, then re-run.');
    process.exit(1);
  }
  if (devices.length > 1 && !serial) {
    console.error('Several devices attached. Pass --serial <id>:');
    devices.forEach((d) => console.error(`  ${d.split(/\s+/)[0]}`));
    process.exit(1);
  }
}

/**
 * Play rejects screenshots showing carrier names, alarm icons or a half-empty
 * battery. Demo mode pins the status bar to a clean 12:00 / full battery / full
 * signal state for the duration of the capture session.
 */
function setDemoMode(on) {
  if (skipDemoMode) return;
  try {
    if (on) {
      adb('shell', 'settings', 'put', 'global', 'sysui_demo_allowed', '1');
      adb('shell', 'am', 'broadcast', '-a', 'com.android.systemui.demo', '-e', 'command', 'enter');
      adb('shell', 'am', 'broadcast', '-a', 'com.android.systemui.demo', '-e', 'command', 'clock', '-e', 'hhmm', '1200');
      adb('shell', 'am', 'broadcast', '-a', 'com.android.systemui.demo', '-e', 'command', 'battery', '-e', 'level', '100', '-e', 'plugged', 'false');
      adb('shell', 'am', 'broadcast', '-a', 'com.android.systemui.demo', '-e', 'command', 'network', '-e', 'wifi', 'show', '-e', 'level', '4');
      adb('shell', 'am', 'broadcast', '-a', 'com.android.systemui.demo', '-e', 'command', 'network', '-e', 'mobile', 'show', '-e', 'level', '4', '-e', 'datatype', 'none');
      adb('shell', 'am', 'broadcast', '-a', 'com.android.systemui.demo', '-e', 'command', 'notifications', '-e', 'visible', 'false');
    } else {
      adb('shell', 'am', 'broadcast', '-a', 'com.android.systemui.demo', '-e', 'command', 'exit');
    }
  } catch {
    console.warn('Could not toggle SystemUI demo mode. Clean the status bar manually.');
  }
}

function capture(file) {
  const remote = '/sdcard/tripenerary-shot.png';
  adb('shell', 'screencap', '-p', remote);
  adb('pull', remote, file);
  adb('shell', 'rm', remote);
}

async function main() {
  requireDevice();

  const outDir = path.join(OUT_ROOT, profileName);
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  console.log(`\nProfile: ${profileName} — ${profile.label}`);
  console.log(`Target size: ${profile.width} x ${profile.height} (${profile.ratio})`);
  console.log(`Output: store/screenshots/${profileName}/\n`);
  console.log('Before you start: load the sample trip, and turn images on in');
  console.log('Settings only if every photo in the itinerary is yours or CC0.\n');

  setDemoMode(true);
  const rl = createInterface({ input: stdin, output: stdout });

  try {
    for (const [i, shot] of SHOTS.entries()) {
      const n = String(i + 1).padStart(2, '0');
      const file = path.join(outDir, `${n}-${shot.name}.png`);
      const answer = await rl.question(`${n}. ${shot.prompt}\n    [Enter] capture · [s] skip · [q] quit > `);
      if (answer.trim().toLowerCase() === 'q') break;
      if (answer.trim().toLowerCase() === 's') continue;
      capture(file);
      console.log(`    saved ${path.relative(ROOT, file)}\n`);
    }
  } finally {
    rl.close();
    setDemoMode(false);
  }

  console.log('\nNext: python3 scripts/fit-screenshots.py');
}

main().catch((err) => {
  setDemoMode(false);
  console.error(err);
  process.exit(1);
});
