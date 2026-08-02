import { Linking, Platform } from 'react-native';

export function hasCoords(loc) {
  return !!loc && typeof loc.lat === 'number' && typeof loc.lng === 'number';
}

export function hasLocation(loc) {
  return !!loc && (hasCoords(loc) || !!loc.name || !!loc.address || !!loc.googleMapsUrl);
}

function query(loc) {
  if (hasCoords(loc)) return loc.lat + ',' + loc.lng;
  return loc.address || loc.name || '';
}

export function mapsUrl(loc) {
  if (!hasLocation(loc)) return null;
  if (loc.googleMapsUrl) return loc.googleMapsUrl;
  const base = 'https://www.google.com/maps/search/?api=1&query=';
  const url = base + encodeURIComponent(query(loc));
  return loc.placeId ? url + '&query_place_id=' + encodeURIComponent(loc.placeId) : url;
}

export function directionsUrl(loc) {
  if (!hasLocation(loc)) return null;
  const url =
    'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(query(loc));
  return loc.placeId ? url + '&destination_place_id=' + encodeURIComponent(loc.placeId) : url;
}

// Prefer the native Google Maps app on Android, fall back to the web URL.
export async function openInMaps(loc, mode) {
  const web = mode === 'directions' ? directionsUrl(loc) : mapsUrl(loc);
  if (!web) return false;

  if (Platform.OS === 'android' && hasCoords(loc)) {
    const label = loc.name ? '(' + loc.name + ')' : '';
    const geo = 'geo:' + loc.lat + ',' + loc.lng + '?q=' + loc.lat + ',' + loc.lng + label;
    try {
      if (await Linking.canOpenURL(geo)) {
        await Linking.openURL(geo);
        return true;
      }
    } catch (e) {
      // fall through to web
    }
  }

  try {
    await Linking.openURL(web);
    return true;
  } catch (e) {
    return false;
  }
}
