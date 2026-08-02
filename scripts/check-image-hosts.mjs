#!/usr/bin/env node
// Probes each candidate image host from *this* machine and reports what works.
//
// Usage: node scripts/check-image-hosts.mjs
//
// Photos failing on device is almost always a host problem rather than an app
// problem, and which host works depends on the network you are on. Run this
// before deciding where to point the itinerary.

const UA = 'Tripenerary/1.0 (https://github.com/tripenerary; itinerary companion app)';

// One known-good Commons file, expressed every way we can reach it.
const FILE = 'Maya_Bay.jpg';
const COMMONS_PATH = 'upload.wikimedia.org/wikipedia/commons/b/bc/Maya_Bay.jpg';

const CANDIDATES = [
  {
    name: 'Wikimedia Special:FilePath',
    url: `https://commons.wikimedia.org/wiki/Special:FilePath/${FILE}?width=900`,
  },
  {
    name: 'Wikimedia upload (original)',
    url: `https://${COMMONS_PATH}`,
  },
  {
    name: 'Wikimedia upload (thumb)',
    url: `https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/${FILE}/900px-${FILE}`,
  },
  {
    name: 'weserv proxy -> Wikimedia',
    url: `https://images.weserv.nl/?url=${encodeURIComponent(COMMONS_PATH)}&w=900&output=jpg`,
  },
  {
    name: 'Lorem Picsum (seeded)',
    url: 'https://picsum.photos/seed/tripenerary/900/600',
  },
  {
    name: 'Unsplash CDN',
    url: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=900',
  },
];

// The two agents that matter: what a phone sends, and what we ask it to send.
const AGENTS = [
  { label: 'okhttp (what RN Android sends by default)', value: 'okhttp/4.9.2' },
  { label: 'our User-Agent', value: UA },
];

async function probe(url, agent) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': agent, Accept: 'image/*,*/*' },
      redirect: 'follow',
      signal: AbortSignal.timeout(20000),
    });
    const kind = res.headers.get('content-type') || '';
    if (!res.ok) return `HTTP ${res.status}`;
    if (!kind.startsWith('image/')) return `not an image (${kind})`;
    const bytes = Number(res.headers.get('content-length') || 0);
    return `ok${bytes ? ` (${Math.round(bytes / 1024)} KB)` : ''}`;
  } catch (e) {
    return `unreachable (${e.name || 'error'})`;
  }
}

console.log('Probing image hosts...\n');

for (const agent of AGENTS) {
  console.log(`As ${agent.label}:`);
  for (const c of CANDIDATES) {
    const result = await probe(c.url, agent.value);
    const mark = result.startsWith('ok') ? '  OK  ' : ' FAIL ';
    console.log(` ${mark} ${c.name.padEnd(30)} ${result}`);
  }
  console.log('');
}

console.log('Any host marked OK under "okhttp" will work on an Android phone.');
