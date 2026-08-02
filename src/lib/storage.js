import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, DEFAULT_PREFS } from '../config';

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

export const getSourceUrl = () => AsyncStorage.getItem(STORAGE_KEYS.source);
export const setSourceUrl = (url) => AsyncStorage.setItem(STORAGE_KEYS.source, url || '');

export const getCachedItinerary = () => readJson(STORAGE_KEYS.data, null);
export const setCachedItinerary = (data) => writeJson(STORAGE_KEYS.data, data);

export const getSyncedAt = () => AsyncStorage.getItem(STORAGE_KEYS.syncedAt);
export const setSyncedAt = (iso) => AsyncStorage.setItem(STORAGE_KEYS.syncedAt, iso);

export async function getPrefs() {
  const saved = await readJson(STORAGE_KEYS.prefs, {});
  return { ...DEFAULT_PREFS, ...saved };
}
export const setPrefs = (prefs) => writeJson(STORAGE_KEYS.prefs, prefs);

export async function clearAll() {
  await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
}
