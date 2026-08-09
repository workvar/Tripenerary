import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
  type Firestore,
} from 'firebase/firestore';
import { DEFAULT_PREFS } from '@/config';
import { getFirebaseDb } from '@/lib/firebase';
import type { Prefs, RawItinerary, TripRecord } from '@/types';

export interface CloudLibrary {
  readonly prefs: Prefs | null;
  readonly activeTripId: string | null;
  readonly trips: readonly TripRecord[];
  readonly tripData: Readonly<Record<string, RawItinerary>>;
  readonly updatedAt: string | null;
}

interface TripDoc extends TripRecord {
  readonly raw: RawItinerary;
}

const userRoot = (db: Firestore, uid: string) => doc(db, 'users', uid);
const prefsDoc = (db: Firestore, uid: string) => doc(db, 'users', uid, 'data', 'prefs');
const metaDoc = (db: Firestore, uid: string) => doc(db, 'users', uid, 'data', 'meta');
const tripsCol = (db: Firestore, uid: string) => collection(db, 'users', uid, 'trips');
const tripDoc = (db: Firestore, uid: string, id: string) => doc(db, 'users', uid, 'trips', id);

function asPrefs(value: unknown): Prefs {
  if (!value || typeof value !== 'object') return DEFAULT_PREFS;
  const partial = value as Partial<Prefs>;
  return {
    showMapPreview: partial.showMapPreview ?? DEFAULT_PREFS.showMapPreview,
    showImages: partial.showImages ?? DEFAULT_PREFS.showImages,
    autoRefreshOnLaunch: partial.autoRefreshOnLaunch ?? DEFAULT_PREFS.autoRefreshOnLaunch,
  };
}

function asTripRecord(id: string, value: Record<string, unknown>): TripRecord | null {
  const url = typeof value['url'] === 'string' ? value['url'] : '';
  const addedAt = typeof value['addedAt'] === 'string' ? value['addedAt'] : new Date().toISOString();
  const syncedAt =
    value['syncedAt'] === null
      ? null
      : typeof value['syncedAt'] === 'string'
        ? value['syncedAt']
        : null;

  const record: TripRecord = {
    id,
    url,
    addedAt,
    syncedAt,
    ...(typeof value['title'] === 'string' ? { title: value['title'] } : {}),
    ...(typeof value['subtitle'] === 'string' ? { subtitle: value['subtitle'] } : {}),
    ...(typeof value['coverImage'] === 'string' ? { coverImage: value['coverImage'] } : {}),
    ...(typeof value['startDate'] === 'string' ? { startDate: value['startDate'] as TripRecord['startDate'] } : {}),
    ...(typeof value['endDate'] === 'string' ? { endDate: value['endDate'] as TripRecord['endDate'] } : {}),
    ...(typeof value['timezone'] === 'string' ? { timezone: value['timezone'] } : {}),
    ...(typeof value['dayCount'] === 'number' ? { dayCount: value['dayCount'] } : {}),
    ...(Array.isArray(value['places'])
      ? { places: value['places'].filter((p): p is string => typeof p === 'string') }
      : {}),
  };
  return record;
}

/** Pull prefs, trip index and cached itineraries for a signed-in user. */
export async function pullLibrary(uid: string): Promise<CloudLibrary | null> {
  const db = getFirebaseDb();
  if (!db) return null;

  const [prefsSnap, metaSnap, tripsSnap] = await Promise.all([
    getDoc(prefsDoc(db, uid)),
    getDoc(metaDoc(db, uid)),
    getDocs(tripsCol(db, uid)),
  ]);

  const prefs = prefsSnap.exists() ? asPrefs(prefsSnap.data()?.['value']) : null;
  const meta = metaSnap.data() ?? {};
  const activeTripId = typeof meta['activeTripId'] === 'string' ? meta['activeTripId'] : null;
  const updatedAt = typeof meta['updatedAt'] === 'string' ? meta['updatedAt'] : null;

  const trips: TripRecord[] = [];
  const tripData: Record<string, RawItinerary> = {};

  for (const snap of tripsSnap.docs) {
    const data = snap.data() as Record<string, unknown>;
    const record = asTripRecord(snap.id, data);
    if (!record) continue;
    trips.push(record);
    if ('raw' in data) tripData[snap.id] = data['raw'];
  }

  return { prefs, activeTripId, trips, tripData, updatedAt };
}

export async function pushPrefs(uid: string, prefs: Prefs): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  await setDoc(prefsDoc(db, uid), { value: prefs, updatedAt: new Date().toISOString() }, { merge: true });
}

export async function pushActiveTripId(uid: string, activeTripId: string | null): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  await setDoc(
    metaDoc(db, uid),
    { activeTripId, updatedAt: new Date().toISOString() },
    { merge: true }
  );
}

export async function pushTrip(
  uid: string,
  trip: TripRecord,
  raw: RawItinerary | undefined
): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  const payload: TripDoc = { ...trip, raw: raw ?? null };
  await setDoc(tripDoc(db, uid, trip.id), payload, { merge: true });
  await setDoc(metaDoc(db, uid), { updatedAt: new Date().toISOString() }, { merge: true });
}

export async function pushTrips(
  uid: string,
  trips: readonly TripRecord[],
  tripData: Readonly<Record<string, RawItinerary>>
): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;

  const batch = writeBatch(db);
  for (const trip of trips) {
    batch.set(tripDoc(db, uid, trip.id), { ...trip, raw: tripData[trip.id] ?? null }, { merge: true });
  }
  batch.set(metaDoc(db, uid), { updatedAt: new Date().toISOString() }, { merge: true });
  batch.set(userRoot(db, uid), { updatedAt: new Date().toISOString() }, { merge: true });
  await batch.commit();
}

export async function deleteCloudTrip(uid: string, id: string): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  await deleteDoc(tripDoc(db, uid, id));
  await setDoc(metaDoc(db, uid), { updatedAt: new Date().toISOString() }, { merge: true });
}

export async function clearCloudLibrary(uid: string): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;

  const snaps = await getDocs(tripsCol(db, uid));
  const batch = writeBatch(db);
  for (const snap of snaps.docs) batch.delete(snap.ref);
  batch.set(prefsDoc(db, uid), { value: DEFAULT_PREFS, updatedAt: new Date().toISOString() });
  batch.set(metaDoc(db, uid), { activeTripId: null, updatedAt: new Date().toISOString() });
  await batch.commit();
}

/**
 * Merge local and cloud libraries.
 * Prefs: cloud wins when present. Trips: union by id, then by URL; newer syncedAt wins.
 */
export function mergeLibraries(
  local: {
    readonly prefs: Prefs;
    readonly activeTripId: string | null;
    readonly trips: readonly TripRecord[];
    readonly tripData: Readonly<Record<string, RawItinerary>>;
  },
  cloud: CloudLibrary
): {
  readonly prefs: Prefs;
  readonly activeTripId: string | null;
  readonly trips: readonly TripRecord[];
  readonly tripData: Readonly<Record<string, RawItinerary>>;
  readonly updatedAt: string | null;
} {
  const byId = new Map<string, { trip: TripRecord; raw: RawItinerary }>();
  const urlToId = new Map<string, string>();

  const consider = (trip: TripRecord, raw: RawItinerary) => {
    const urlOwner = trip.url ? urlToId.get(trip.url) : undefined;
    const existingId = byId.has(trip.id) ? trip.id : urlOwner;
    if (!existingId) {
      byId.set(trip.id, { trip, raw });
      if (trip.url) urlToId.set(trip.url, trip.id);
      return;
    }

    const existing = byId.get(existingId)!;
    const a = existing.trip.syncedAt ? new Date(existing.trip.syncedAt).getTime() : 0;
    const b = trip.syncedAt ? new Date(trip.syncedAt).getTime() : 0;
    // Keep the existing id so local document caches stay addressable.
    const winnerTrip = b >= a ? { ...trip, id: existingId } : existing.trip;
    const winnerRaw = b >= a ? (raw ?? existing.raw) : (existing.raw ?? raw);
    byId.set(existingId, { trip: winnerTrip, raw: winnerRaw });
    if (winnerTrip.url) urlToId.set(winnerTrip.url, existingId);
  };

  for (const trip of local.trips) consider(trip, local.tripData[trip.id] ?? null);
  for (const trip of cloud.trips) consider(trip, cloud.tripData[trip.id] ?? null);

  const trips: TripRecord[] = [];
  const tripData: Record<string, RawItinerary> = {};
  for (const { trip, raw } of byId.values()) {
    trips.push(trip);
    if (raw != null) tripData[trip.id] = raw;
  }

  const activeTripId =
    (cloud.activeTripId && trips.some((t) => t.id === cloud.activeTripId) && cloud.activeTripId) ||
    (local.activeTripId && trips.some((t) => t.id === local.activeTripId) && local.activeTripId) ||
    null;

  return {
    prefs: cloud.prefs ?? local.prefs,
    activeTripId,
    trips,
    tripData,
    updatedAt: cloud.updatedAt,
  };
}
