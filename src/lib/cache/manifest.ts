import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/config';

/** What the server said the file was when we downloaded it. Refresh compares a
 *  fresh HEAD against this to decide whether the cached copy is still current. */
export interface DocumentRecord {
  readonly url: string;
  readonly etag: string;
  readonly length: number;
  readonly fetchedAt: string;
}

export type Manifest = Record<string, DocumentRecord>;

/** `<tripId>/<fileName>`, matching the on-disk layout. */
export const entryKey = (tripId: string, name: string): string => `${tripId}/${name}`;

// Held in memory so a tap does not wait on storage, written back on every change.
let loaded: Manifest | null = null;

async function load(): Promise<Manifest> {
  if (loaded) return loaded;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.documents);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    loaded = parsed && typeof parsed === 'object' ? (parsed as Manifest) : {};
  } catch {
    loaded = {};
  }
  return loaded;
}

async function save(next: Manifest): Promise<void> {
  loaded = next;
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.documents, JSON.stringify(next));
  } catch {
    // storage full or unavailable; the files are still on disk and usable
  }
}

export const readManifest = (): Promise<Manifest> => load();

export async function getRecord(key: string): Promise<DocumentRecord | null> {
  return (await load())[key] ?? null;
}

export async function putRecord(key: string, record: DocumentRecord): Promise<void> {
  await save({ ...(await load()), [key]: record });
}

export async function dropRecords(keys: readonly string[]): Promise<void> {
  if (keys.length === 0) return;
  const next = { ...(await load()) };
  for (const key of keys) delete next[key];
  await save(next);
}

/** Used when a trip is removed: forget everything filed under its id. */
export async function dropTrip(tripId: string): Promise<void> {
  const prefix = `${tripId}/`;
  const current = await load();
  const keys = Object.keys(current).filter((k) => k.startsWith(prefix));
  await dropRecords(keys);
}

export async function clearManifest(): Promise<void> {
  await save({});
}
