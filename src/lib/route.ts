import { hasCoords } from '@/lib/maps';
import type { Day, Stay, TripLocation } from '@/types';

export interface RouteStop {
  readonly key: string;
  readonly label: string;
  readonly name: string;
  readonly lat: number;
  readonly lng: number;
  /** True for the synthetic stop that closes the loop back to the start. */
  readonly isReturn: boolean;
}

export interface RouteRegion {
  readonly latitude: number;
  readonly longitude: number;
  readonly latitudeDelta: number;
  readonly longitudeDelta: number;
}

const MIN_DELTA = 0.01;
const PADDING = 1.6;

const same = (a: RouteStop, b: RouteStop) =>
  Math.abs(a.lat - b.lat) < 1e-6 && Math.abs(a.lng - b.lng) < 1e-6;

function toStop(
  loc: TripLocation | null,
  key: string,
  label: string,
  isReturn = false
): RouteStop | null {
  if (!hasCoords(loc)) return null;
  return { key, label, name: loc.name || loc.address || label, lat: loc.lat, lng: loc.lng, isReturn };
}

/** Ordered stops for a day: the stay, then every pinned schedule item, then a
 *  closing leg back to the stay so the shape reads as a perimeter. */
export function buildRoute(day: Day, stay: Stay | null): readonly RouteStop[] {
  const start = stay ? toStop(stay.location, 'stay-start', 'Stay') : null;

  const middle = day.items
    .map((item, i) => toStop(item.location, item.key, String(i + 1)))
    .filter((s): s is RouteStop => s !== null);

  const stops: RouteStop[] = [];
  for (const stop of [start, ...middle].filter((s): s is RouteStop => s !== null)) {
    const prev = stops[stops.length - 1];
    if (!prev || !same(prev, stop)) stops.push(stop);
  }

  // Renumber the visible stops so gaps from unpinned items do not show.
  const numbered = stops.map((stop, i) =>
    stop.key === 'stay-start' ? stop : { ...stop, label: String(start ? i : i + 1) }
  );

  const last = numbered[numbered.length - 1];
  if (start && last && !same(start, last) && numbered.length > 1) {
    numbered.push({ ...start, key: 'stay-end', isReturn: true });
  }

  return numbered;
}

export function regionFor(stops: readonly RouteStop[]): RouteRegion | null {
  if (stops.length === 0) return null;

  const lats = stops.map((s) => s.lat);
  const lngs = stops.map((s) => s.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * PADDING, MIN_DELTA),
    longitudeDelta: Math.max((maxLng - minLng) * PADDING, MIN_DELTA),
  };
}

/** Google Maps directions link covering every stop in order. */
export function routeUrl(stops: readonly RouteStop[]): string | null {
  if (stops.length < 2) return null;

  const point = (s: RouteStop | undefined) => (s ? `${s.lat},${s.lng}` : '');
  const origin = point(stops[0]);
  const destination = point(stops[stops.length - 1]);
  if (!origin || !destination) return null;

  const waypoints = stops.slice(1, -1).map(point).join('|');

  const base = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
  return waypoints ? `${base}&waypoints=${encodeURIComponent(waypoints)}` : base;
}
