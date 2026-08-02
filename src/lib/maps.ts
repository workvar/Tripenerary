import { Linking, Platform } from 'react-native';
import type { TripLocation } from '@/types';

export type MapMode = 'search' | 'directions';

/** A location that is guaranteed to carry coordinates. */
type PinnedLocation = TripLocation & { lat: number; lng: number };

export function hasCoords(loc: TripLocation | null | undefined): loc is PinnedLocation {
  return !!loc && typeof loc.lat === 'number' && typeof loc.lng === 'number';
}

export function hasLocation(loc: TripLocation | null | undefined): loc is TripLocation {
  return !!loc && (hasCoords(loc) || !!loc.name || !!loc.address || !!loc.googleMapsUrl);
}

function query(loc: TripLocation): string {
  if (hasCoords(loc)) return `${loc.lat},${loc.lng}`;
  return loc.address || loc.name || '';
}

export function mapsUrl(loc: TripLocation | null | undefined): string | null {
  if (!hasLocation(loc)) return null;
  if (loc.googleMapsUrl) return loc.googleMapsUrl;

  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query(loc))}`;
  return loc.placeId ? `${url}&query_place_id=${encodeURIComponent(loc.placeId)}` : url;
}

export function directionsUrl(loc: TripLocation | null | undefined): string | null {
  if (!hasLocation(loc)) return null;

  const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query(loc))}`;
  return loc.placeId ? `${url}&destination_place_id=${encodeURIComponent(loc.placeId)}` : url;
}

/** Prefer the native Google Maps app on Android, fall back to the web URL. */
export async function openInMaps(
  loc: TripLocation | null | undefined,
  mode: MapMode = 'search'
): Promise<boolean> {
  const web = mode === 'directions' ? directionsUrl(loc) : mapsUrl(loc);
  if (!web) return false;

  if (Platform.OS === 'android' && hasCoords(loc)) {
    const label = loc.name ? `(${loc.name})` : '';
    const geo = `geo:${loc.lat},${loc.lng}?q=${loc.lat},${loc.lng}${label}`;
    try {
      if (await Linking.canOpenURL(geo)) {
        await Linking.openURL(geo);
        return true;
      }
    } catch {
      // fall through to the web URL
    }
  }

  try {
    await Linking.openURL(web);
    return true;
  } catch {
    return false;
  }
}
