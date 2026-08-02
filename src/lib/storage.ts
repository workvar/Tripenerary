import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_PREFS, STORAGE_KEYS } from '@/config';
import type { Prefs, RawItinerary, TripRecord } from '@/types';

const tripDataKey = (id: string): string => `tc:trip:${id}`;

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable; non-fatal
  }
}

/* ---------- trip index ---------- */

export async function getTrips(): Promise<TripRecord[]> {
  const list = await readJson<TripRecord[]>(STORAGE_KEYS.trips, []);
  return Array.isArray(list) ? list : [];
}

export const setTrips = (list: readonly TripRecord[]): Promise<void> =>
  writeJson(STORAGE_KEYS.trips, list);

/* ---------- per-trip payload ---------- */

export const getTripData = (id: string): Promise<RawItinerary> =>
  readJson<RawItinerary>(tripDataKey(id), null);

export const setTripData = (id: string, raw: RawItinerary): Promise<void> =>
  writeJson(tripDataKey(id), raw);

export async function removeTripData(id: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(tripDataKey(id));
  } catch {
    // ignore
  }
}

/* ---------- last opened trip ---------- */

export const getActiveTripId = (): Promise<string | null> =>
  AsyncStorage.getItem(STORAGE_KEYS.activeTrip);

export const setActiveTripId = (id: string | null): Promise<void> =>
  id
    ? AsyncStorage.setItem(STORAGE_KEYS.activeTrip, id)
    : AsyncStorage.removeItem(STORAGE_KEYS.activeTrip);

/* ---------- prefs ---------- */

export async function getPrefs(): Promise<Prefs> {
  const saved = await readJson<Partial<Prefs>>(STORAGE_KEYS.prefs, {});
  return { ...DEFAULT_PREFS, ...saved };
}

export const setPrefs = (prefs: Prefs): Promise<void> => writeJson(STORAGE_KEYS.prefs, prefs);

/* ---------- v1 -> v2 migration ---------- */

export interface LegacyTrip extends TripRecord {
  readonly raw: RawItinerary;
}

/** The old build stored a single URL plus its cached JSON. Fold that into the library. */
export async function migrateLegacy(): Promise<LegacyTrip | null> {
  const url = await AsyncStorage.getItem(STORAGE_KEYS.legacySource);
  const raw = await readJson<RawItinerary>(STORAGE_KEYS.legacyData, null);
  if (!url && !raw) return null;

  const id = `legacy-${Date.now().toString(36)}`;
  const syncedAt = await AsyncStorage.getItem(STORAGE_KEYS.legacySyncedAt);
  if (raw) await setTripData(id, raw);

  await AsyncStorage.multiRemove([
    STORAGE_KEYS.legacySource,
    STORAGE_KEYS.legacyData,
    STORAGE_KEYS.legacySyncedAt,
  ]);

  return { id, url: url ?? '', addedAt: new Date().toISOString(), syncedAt, raw };
}

/* ---------- reset ---------- */

export async function clearAll(): Promise<void> {
  const trips = await getTrips();
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.trips,
    STORAGE_KEYS.activeTrip,
    STORAGE_KEYS.prefs,
    ...trips.map((t) => tripDataKey(t.id)),
  ]);
}
