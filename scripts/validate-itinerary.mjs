#!/usr/bin/env node
// Standalone checker for itinerary JSON files.
// Usage: node scripts/validate-itinerary.mjs path/to/itinerary.json

import { readFileSync } from 'node:fs';

const TYPES = ['sight', 'food', 'travel', 'flight', 'hotel', 'activity', 'rest', 'note'];
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
let imageCount = 0;

function checkImages(value, at) {
  imageUrls(value).forEach((url, i) => {
    if (!url) warnings.push(at + '[' + i + '] has no usable url and will be skipped.');
    else if (!/^https:\/\//i.test(url)) {
      warnings.push(at + '[' + i + '] is not an https URL; it will not load on device.');
    } else imageCount += 1;
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
}

if (!Array.isArray(data.days) || data.days.length === 0) {
  errors.push('"days" must be a non-empty array.');
}

const stayIds = new Set((data.stays || []).map((s) => s.id));
(data.stays || []).forEach((s, i) => {
  if (!s.id) errors.push('stays[' + i + '] is missing "id".');
  if (!s.name) errors.push('stays[' + i + '] is missing "name".');
  if (s.image) checkImages(s.image, 'stays[' + i + '].image');
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
  stayIds.size + ' stays, ' + imageCount + ' images.'
);
