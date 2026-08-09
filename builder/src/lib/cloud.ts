import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  getDownloadURL,
  ref,
  uploadString,
  getMetadata,
} from 'firebase/storage';
import { exportByteLength, toJsonString } from '@/lib/exportJson';
import {
  getFirebaseDb,
  getFirebaseStorage,
  MAX_CLOUD_BYTES,
} from '@/lib/firebase';
import { normalizeDraft } from '@/lib/normalizeDraft';
import type { Draft } from '@/types/itinerary';

export type SaveStatus =
  | 'idle'
  | 'saving'
  | 'saved'
  | 'offline'
  | 'over-limit'
  | 'error'
  | 'unsigned';

export interface CloudMeta {
  readonly updatedAt: string | null;
  readonly bytes: number;
  readonly publishedUrl: string | null;
  readonly publishedAt: string | null;
  readonly publishId: string | null;
}

const metaRef = (uid: string) => {
  const db = getFirebaseDb();
  if (!db) return null;
  return doc(db, 'users', uid, 'builder', 'meta');
};

const draftPath = (uid: string) => `users/${uid}/builder/draft.json`;
const publishPath = (uid: string, id: string) => `published/${uid}/${id}.json`;

export async function loadCloudMeta(uid: string): Promise<CloudMeta> {
  const empty: CloudMeta = {
    updatedAt: null,
    bytes: 0,
    publishedUrl: null,
    publishedAt: null,
    publishId: null,
  };
  const refDoc = metaRef(uid);
  if (!refDoc) return empty;
  const snap = await getDoc(refDoc);
  if (!snap.exists()) return empty;
  const data = snap.data();
  return {
    updatedAt: typeof data['updatedAt'] === 'string' ? data['updatedAt'] : null,
    bytes: typeof data['bytes'] === 'number' ? data['bytes'] : 0,
    publishedUrl: typeof data['publishedUrl'] === 'string' ? data['publishedUrl'] : null,
    publishedAt: typeof data['publishedAt'] === 'string' ? data['publishedAt'] : null,
    publishId: typeof data['publishId'] === 'string' ? data['publishId'] : null,
  };
}

export async function loadCloudDraft(uid: string): Promise<Draft | null> {
  const storage = getFirebaseStorage();
  if (!storage) return null;
  try {
    const file = ref(storage, draftPath(uid));
    const url = await getDownloadURL(file);
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    return normalizeDraft(await res.json());
  } catch {
    return null;
  }
}

export async function saveCloudDraft(
  uid: string,
  draft: Draft
): Promise<{ ok: true; bytes: number; updatedAt: string } | { ok: false; error: string; overLimit?: boolean }> {
  const storage = getFirebaseStorage();
  const meta = metaRef(uid);
  if (!storage || !meta) return { ok: false, error: 'Cloud save is not configured.' };

  const json = toJsonString(draft);
  const bytes = exportByteLength(draft);
  if (bytes > MAX_CLOUD_BYTES) {
    return {
      ok: false,
      overLimit: true,
      error: `Trip is ${(bytes / (1024 * 1024)).toFixed(1)} MB. Cloud save is capped at 20 MB.`,
    };
  }

  try {
    const file = ref(storage, draftPath(uid));
    await uploadString(file, json, 'raw', { contentType: 'application/json' });
    const updatedAt = new Date().toISOString();
    await setDoc(
      meta,
      { updatedAt, bytes, title: draft.trip.title },
      { merge: true }
    );
    return { ok: true, bytes, updatedAt };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Could not save to the cloud.' };
  }
}

export async function publishDraft(
  uid: string,
  draft: Draft,
  existingPublishId: string | null
): Promise<
  | { ok: true; url: string; publishId: string; publishedAt: string; bytes: number }
  | { ok: false; error: string; overLimit?: boolean }
> {
  const storage = getFirebaseStorage();
  const meta = metaRef(uid);
  if (!storage || !meta) return { ok: false, error: 'Publishing is not configured.' };

  const json = toJsonString(draft);
  const bytes = exportByteLength(draft);
  if (bytes > MAX_CLOUD_BYTES) {
    return {
      ok: false,
      overLimit: true,
      error: `Trip is ${(bytes / (1024 * 1024)).toFixed(1)} MB. Publishing is capped at 20 MB.`,
    };
  }

  const publishId =
    existingPublishId && /^[a-z0-9_-]+$/i.test(existingPublishId)
      ? existingPublishId
      : `trip-${Date.now().toString(36)}`;

  try {
    const file = ref(storage, publishPath(uid, publishId));
    await uploadString(file, json, 'raw', {
      contentType: 'application/json',
      customMetadata: { title: draft.trip.title || 'trip' },
    });
    // Force a public-style download URL the Expo app can fetch directly.
    const url = await getDownloadURL(file);
    const publishedAt = new Date().toISOString();

    // Also refresh the private draft so Save and Publish stay aligned.
    const draftFile = ref(storage, draftPath(uid));
    await uploadString(draftFile, json, 'raw', { contentType: 'application/json' });

    await setDoc(
      meta,
      {
        updatedAt: publishedAt,
        bytes,
        publishedUrl: url,
        publishedAt,
        publishId,
        title: draft.trip.title,
      },
      { merge: true }
    );

    return { ok: true, url, publishId, publishedAt, bytes };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Could not publish.' };
  }
}

export async function measureStoredDraft(uid: string): Promise<number> {
  const storage = getFirebaseStorage();
  if (!storage) return 0;
  try {
    const meta = await getMetadata(ref(storage, draftPath(uid)));
    return meta.size;
  } catch {
    return 0;
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
