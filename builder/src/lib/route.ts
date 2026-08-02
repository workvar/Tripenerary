import type { DraftDay, DraftLocation, DraftStay } from '@/types/itinerary';

export interface RouteStop {
  readonly key: string;
  readonly label: string;
  readonly name: string;
  readonly lat: number;
  readonly lng: number;
  readonly isStay: boolean;
}

function coords(loc: DraftLocation): { lat: number; lng: number } | null {
  const lat = Number.parseFloat(loc.lat);
  const lng = Number.parseFloat(loc.lng);
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}

const same = (a: RouteStop, b: RouteStop) =>
  Math.abs(a.lat - b.lat) < 1e-6 && Math.abs(a.lng - b.lng) < 1e-6;

/** Same shape as src/lib/route.ts in the app: stay first, then pinned blocks. */
export function buildRoute(day: DraftDay, stay: DraftStay | null): RouteStop[] {
  const stops: RouteStop[] = [];

  const stayAt = stay ? coords(stay.location) : null;
  if (stayAt) {
    stops.push({ key: 'stay', label: '\u{2302}', name: stay?.name || 'Stay', isStay: true, ...stayAt });
  }

  day.items.forEach((item) => {
    const at = coords(item.location);
    if (!at) return;
    const stop: RouteStop = {
      key: item.id,
      label: '',
      name: item.location.name || item.title || 'Stop',
      isStay: false,
      ...at,
    };
    const prev = stops[stops.length - 1];
    if (!prev || !same(prev, stop)) stops.push(stop);
  });

  let n = 0;
  return stops.map((s) => (s.isStay ? s : { ...s, label: String((n += 1)) }));
}

export interface Point {
  readonly x: number;
  readonly y: number;
}

/** Projects stops into a fixed-size box, padded so pins are never clipped. */
export function project(stops: readonly RouteStop[], w: number, h: number, pad = 26): Point[] {
  if (stops.length === 0) return [];

  const lats = stops.map((s) => s.lat);
  const lngs = stops.map((s) => s.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const spanLat = maxLat - minLat || 1;
  const spanLng = maxLng - minLng || 1;
  const scale = Math.min((w - pad * 2) / spanLng, (h - pad * 2) / spanLat);

  const offsetX = (w - spanLng * scale) / 2;
  const offsetY = (h - spanLat * scale) / 2;

  return stops.map((s) => ({
    x: offsetX + (s.lng - minLng) * scale,
    y: offsetY + (maxLat - s.lat) * scale,
  }));
}
