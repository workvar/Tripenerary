#!/usr/bin/env node
// Standalone checker for itinerary JSON files.
//
// Usage: node scripts/validate-itinerary.mjs path/to/itinerary.json [--check-images]
//
// --check-images additionally requests every image URL and reports the ones a
// phone would fail to load. Worth running whenever photos do not show up.

import { readFileSync } from 'node:fs';

const TYPES = ['sight', 'food', 'travel', 'flight', 'hotel', 'activity', 'rest', 'note'];
const ATTACHMENT_KINDS = ['pdf', 'image', 'doc', 'ticket', 'link'];
const isKey = (v) => /^\d{4}-\d{2}-\d{2}$/.test(String(v || ''));

// Images may be a URL string, an { url } object, or an array of either.
function imageUrls(value) {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  return list.map((v) => (typeof v === 'string' ? v : v && (v.url || v.src || v.uri)) || '');
}

const file = process.argv[2];
if (!file) {
  console.error('Usage: node scripts/validate-itinerary.mjs <file.json>');
  process.exit(2);
}

let data;
try {
  data = JSON.parse(readFileSync(file, 'utf8'));
} catch (e) {
  console.error('FAIL  Not valid JSON: ' + e.message);
  process.exit(1);
}

const errors = [];
const warnings = [];
const seenImages = new Map(); // url -> first location it appeared
let imageCount = 0;
let attachmentCount = 0;

// Attachments follow the same shape rule as images: a URL string or an object.
function checkAttachments(value, at) {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  list.forEach((entry, i) => {
    const spot = at + '[' + i + ']';
    const url = typeof entry === 'string' ? entry : entry && (entry.url || entry.href || entry.link);
    if (!url) {
      warnings.push(spot + ' has no usable url and will be skipped.');
      return;
    }
    if (!/^https:\/\//i.test(url)) {
      warnings.push(spot + ' is not an https URL; the phone may refuse to open it.');
    }
    const kind = entry && typeof entry === 'object' ? entry.kind || entry.type : undefined;
    if (kind && !ATTACHMENT_KINDS.includes(kind)) {
      warnings.push(spot + '.kind "' + kind + '" is unknown, will render as "link".');
    }
    attachmentCount += 1;
  });
}

function checkImages(value, at) {
  imageUrls(value).forEach((url, i) => {
    if (!url) warnings.push(at + '[' + i + '] has no usable url and will be skipped.');
    else if (!/^https:\/\//i.test(url)) {
      warnings.push(at + '[' + i + '] is not an https URL; it will not load on device.');
    } else {
      imageCount += 1;
      if (!seenImages.has(url)) seenImages.set(url, at + '[' + i + ']');
    }
  });
}

if (!data.trip || typeof data.trip !== 'object') errors.push('Missing "trip" object.');
else {
  if (!data.trip.title) errors.push('trip.title is required.');
  ['startDate', 'endDate'].forEach((k) => {
    if (!isKey(data.trip[k])) errors.push('trip.' + k + ' must be YYYY-MM-DD.');
  });
  if (!data.trip.timezone) warnings.push('trip.timezone missing; "today" will use the device timezone.');
  if (data.trip.coverImage) checkImages(data.trip.coverImage, 'trip.coverImage');
  else warnings.push('trip.coverImage missing; the home screen card will have no photo.');
  if (data.trip.attachments) checkAttachments(data.trip.attachments, 'trip.attachments');
}

if (!Array.isArray(data.days) || data.days.length === 0) {
  errors.push('"days" must be a non-empty array.');
}

const stayIds = new Set((data.stays || []).map((s) => s.id));
(data.stays || []).forEach((s, i) => {
  if (!s.id) errors.push('stays[' + i + '] is missing "id".');
  if (!s.name) errors.push('stays[' + i + '] is missing "name".');
  if (s.image) checkImages(s.image, 'stays[' + i + '].image');
  if (s.attachments) checkAttachments(s.attachments, 'stays[' + i + '].attachments');
});

const seenDates = new Set();
(data.days || []).forEach((d, i) => {
  const at = 'days[' + i + ']';
  if (!isKey(d.date)) errors.push(at + '.date must be YYYY-MM-DD.');
  else if (seenDates.has(d.date)) errors.push(at + '.date "' + d.date + '" is duplicated.');
  else seenDates.add(d.date);

  if (d.stayId && !stayIds.has(d.stayId)) {
    errors.push(at + '.stayId "' + d.stayId + '" does not match any stays[].id.');
  }
  if (d.image) checkImages(d.image, at + '.image');
  if (!Array.isArray(d.items)) {
    warnings.push(at + ' has no "items" array.');
    return;
  }
  d.items.forEach((it, j) => {
    const iat = at + '.items[' + j + ']';
    if (!it.title) errors.push(iat + '.title is required.');
    if (it.type && !TYPES.includes(it.type)) {
      warnings.push(iat + '.type "' + it.type + '" is unknown, will render as "activity".');
    }
    if (it.images || it.image) checkImages(it.images || it.image, iat + '.images');
    if (it.attachments) checkAttachments(it.attachments, iat + '.attachments');
    const loc = it.location;
    if (loc) {
      const hasLat = typeof loc.lat === 'number';
      const hasLng = typeof loc.lng === 'number';
      if (hasLat !== hasLng) errors.push(iat + '.location needs both lat and lng.');
      if (hasLat && (loc.lat < -90 || loc.lat > 90)) errors.push(iat + '.location.lat out of range.');
      if (hasLng && (loc.lng < -180 || loc.lng > 180)) errors.push(iat + '.location.lng out of range.');
      if (!hasLat && !loc.name && !loc.address && !loc.googleMapsUrl) {
        warnings.push(iat + '.location has nothing usable and will be ignored.');
      }
    }
  });
});

(data.info || []).forEach((section, i) => {
  if (section && section.image) checkImages(section.image, 'info[' + i + '].image');
});

const dayCount = (data.days || []).length;
const itemCount = (data.days || []).reduce((n, d) => n + ((d.items || []).length), 0);
const pinned = (data.days || []).reduce(
  (n, d) => n + (d.items || []).filter((i) => i.location && typeof i.location.lat === 'number').length, 0
);

warnings.forEach((w) => console.log('WARN  ' + w));
errors.forEach((e) => console.log('FAIL  ' + e));

if (errors.length) {
  console.log('\n' + errors.length + ' error(s). Not loadable.');
  process.exit(1);
}
console.log(
  '\nOK  ' + dayCount + ' days, ' + itemCount + ' items, ' + pinned + ' mapped locations, ' +
  stayIds.size + ' stays, ' + imageCount + ' images (' + seenImages.size + ' distinct), ' +
  attachmentCount + ' attachments.'
);

if (process.argv.includes('--check-images')) {
  await checkImagesReachable();
}

// Phones give up silently on an image that 404s, redirects badly, or comes back
// as HTML. Ask for each one the way the device would and report what happened.
async function checkImagesReachable() {
  const urls = [...seenImages.keys()];
  console.log('\nRequesting ' + urls.length + ' image URLs...');

  const problems = [];
  let done = 0;

  const note = (reason, url) => problems.push(reason + '\n      ' + url + '\n      used at ' + seenImages.get(url));

  const check = async (url) => {
    try {
      const res = await fetch(url, {
        headers: {
          // Match src/config.ts IMAGE_HEADERS: Wikimedia and friends answer 403
          // to a generic agent, which is what the app hits without this.
          'User-Agent': 'Tripenerary/1.0 (https://github.com/tripenerary; itinerary companion app)',
          Accept: 'image/avif,image/webp,image/jpeg,image/png,*/*',
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(20000),
      });
      const kind = res.headers.get('content-type') || '';
      if (!res.ok) note('HTTP ' + res.status, url);
      else if (!kind.startsWith('image/')) note('not an image, got ' + kind, url);
    } catch (e) {
      note('unreachable (' + (e.name || 'error') + ')', url);
    } finally {
      done += 1;
      if (done % 20 === 0) console.log('  ...' + done + '/' + urls.length);
    }
  };

  // Small concurrency so we stay polite to the host.
  const queue = [...urls];
  await Promise.all(
    Array.from({ length: 6 }, async () => {
      for (let next = queue.pop(); next; next = queue.pop()) await check(next);
    })
  );

  if (problems.length === 0) {
    console.log('All ' + urls.length + ' images loaded.');
    return;
  }
  console.log('\n' + problems.length + ' image(s) a phone could not load:');
  problems.forEach((p) => console.log('  ' + p));
  process.exitCode = 1;
}
