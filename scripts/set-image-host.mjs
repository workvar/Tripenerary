#!/usr/bin/env node
// Re-points every image in the sample itinerary at a different host.
//
// Usage: node scripts/set-image-host.mjs <host> [file.json]
//
//   filepath   Wikimedia Special:FilePath, resizes server-side, one redirect
//   upload     Wikimedia CDN original, no redirect
//   thumb      Wikimedia CDN pre-scaled thumbnail
//   weserv     images.weserv.nl proxying the Wikimedia CDN
//   picsum     Lorem Picsum, seeded per photo. Always loads, generic imagery
//   local      ./assets/photos/<file>, for photos you host yourself
//
// The mapping of photo to itinerary slot lives in sample/image-manifest.json, so
// switching hosts never loses the curation. Verify afterwards with:
//   node scripts/validate-itinerary.mjs sample/thailand-sample.json --check-images

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const WIDTH = 900;

const commonsDir = (file) => {
  const hash = createHash('md5').update(file).digest('hex');
  return `${hash[0]}/${hash.slice(0, 2)}`;
};

const slug = (file) => file.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase();

const BUILDERS = {
  filepath: (f) => `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(f)}?width=${WIDTH}`,
  upload: (f) => `https://upload.wikimedia.org/wikipedia/commons/${commonsDir(f)}/${encodeURIComponent(f)}`,
  thumb: (f) =>
    `https://upload.wikimedia.org/wikipedia/commons/thumb/${commonsDir(f)}/${encodeURIComponent(f)}/${WIDTH}px-${encodeURIComponent(f)}`,
  weserv: (f) =>
    `https://images.weserv.nl/?url=${encodeURIComponent(`upload.wikimedia.org/wikipedia/commons/${commonsDir(f)}/${encodeURIComponent(f)}`)}&w=${WIDTH}&output=jpg&q=78`,
  picsum: (f) => `https://picsum.photos/seed/${slug(f)}/${WIDTH}/600`,
  local: (f) => `./assets/photos/${f}`,
};

const host = process.argv[2];
const target = process.argv[3] || 'sample/thailand-sample.json';

if (!host || !BUILDERS[host]) {
  console.error('Usage: node scripts/set-image-host.mjs <' + Object.keys(BUILDERS).join('|') + '> [file.json]');
  process.exit(2);
}

const manifest = JSON.parse(readFileSync('sample/image-manifest.json', 'utf8'));
const data = JSON.parse(readFileSync(target, 'utf8'));
const build = BUILDERS[host];

// Walk a path like `days[3].items[1].images[0]` and set the URL it points at.
function assign(root, path, url) {
  const steps = path.match(/[^.[\]]+/g) ?? [];
  const last = steps.pop();
  let node = root;
  for (const step of steps) node = node[/^\d+$/.test(step) ? Number(step) : step];
  const key = /^\d+$/.test(last) ? Number(last) : last;

  // Item galleries hold objects with a caption; every other slot is a bare string.
  if (typeof node[key] === 'object' && node[key] !== null) node[key].url = url;
  else node[key] = url;
}

let applied = 0;
for (const { path, file } of manifest.entries) {
  assign(data, path, build(file));
  applied += 1;
}

writeFileSync(target, JSON.stringify(data, null, 2) + '\n');
console.log(`Rewrote ${applied} image URLs in ${target} to "${host}".`);
console.log(`Example: ${build(manifest.entries[0].file)}`);
