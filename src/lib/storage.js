import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, DEFAULT_PREFS } from '../config';

const tripDataKey = (id) => 'tc:trip:' + id;

async function readJson(key, fallback) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

async function writeJson(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // storage full or unavailable; non-fatal
  }
}

/* ---------- trip index ----------
   One entry per trip:
   { id, url, addedAt, syncedAt, title, subtitle, coverImage, startDate, endDate, days } */

export async function getTrips() {
  const list = await readJson(STORAGE_KEYS.trips, []);
  return Array.isArray(list) ? list : [];
}

export const setTrips = (list) => writeJson(STORAGE_KEYS.trips, list);

/* ---------- per-trip payload ---------- */

export const getTripData = (id) => readJson(tripDataKey(id), null);
export const setTripData = (id, raw) => writeJson(tripDataKey(id), raw);

export async function removeTripData(id) {
  try {
    await AsyncStorage.removeItem(tripDataKey(id));
  } catch (e) {
    // ignore
  }
}

/* ---------- last opened trip ---------- */

export const getActiveTripId = () => AsyncStorage.getItem(STORAGE_KEYS.activeTrip);
export const setActiveTripId = (id) =>
  id
    ? AsyncStorage.setItem(STORAGE_KEYS.activeTrip, String(id))
    : AsyncStorage.removeItem(STORAGE_KEYS.activeTrip);

/* ---------- prefs ---------- */

export async function getPrefs() {
  const saved = await readJson(STORAGE_KEYS.prefs, {});
  return { ...DEFAULT_PREFS, ...saved };
}
export const setPrefs = (prefs) => writeJson(STORAGE_KEYS.prefs, prefs);

/* ---------- v1 -> v2 migration ---------- */
// The old build stored a single URL plus its cached JSON. Fold that into the library.

export async function migrateLegacy() {
  const url = await AsyncStorage.getItem(STORAGE_KEYS.legacySource);
  const raw = await readJson(STORAGE_KEYS.legacyData, null);
  if (!url && !raw) return null;

  const id = 'legacy-' + Date.now().toString(36);
  const syncedAt = await AsyncStorage.getItem(STORAGE_KEYS.legacySyncedAt);
  if (raw) await setTripData(id, raw);

  await AsyncStorage.multiRemove([
    STORAGE_KEYS.legacySource,
    STORAGE_KEYS.legacyData,
    STORAGE_KEYS.legacySyncedAt,
  ]);

  return {
    id,
    url: url || '',
    addedAt: new Date().toISOString(),
    syncedAt: syncedAt || null,
    raw,
  };
}

/* ---------- reset ---------- */

export async function clearAll() {
  const trips = await getTrips();
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.trips,
    STORAGE_KEYS.activeTrip,
    STORAGE_KEYS.prefs,
    ...trips.map((t) => tripDataKey(t.id)),
  ]);
}
