import { Directory, File, Paths } from 'expo-file-system';
import { DOCUMENT_CACHE } from '@/config';
import { cacheName } from './keys';
import type { Attachment } from '@/types';

/**
 * Documents live under the app's private document directory, one folder per trip:
 *
 *   documents/<tripId>/<hash>.pdf
 *
 * Per-trip folders make deletion trivial: removing a trip is one `delete()`, and
 * sweeping orphans only has to look at that trip's own files.
 *
 * Every call here is wrapped: the filesystem API throws on a missing path, and a
 * cache miss must never be louder than the itinerary it belongs to.
 */

const root = (): Directory => new Directory(Paths.document, DOCUMENT_CACHE.dirName);

const tripDir = (tripId: string): Directory => new Directory(root(), tripId);

const quiet = <T>(fn: () => T, fallback: T): T => {
  try {
    return fn();
  } catch {
    return fallback;
  }
};

export function ensureTripDir(tripId: string): Directory {
  const dir = tripDir(tripId);
  quiet(() => dir.create({ intermediates: true, idempotent: true }), undefined);
  return dir;
}

export function fileFor(tripId: string, attachment: Attachment): File {
  return new File(tripDir(tripId), cacheName(attachment.url, attachment.kind));
}

/** A zero-byte file is a failed download, not a cache hit. */
export function isCached(tripId: string, attachment: Attachment): boolean {
  return quiet(() => {
    const file = fileFor(tripId, attachment);
    return file.exists && file.size > 0;
  }, false);
}

export function cachedSize(tripId: string, attachment: Attachment): number {
  return quiet(() => {
    const file = fileFor(tripId, attachment);
    return file.exists ? file.size : 0;
  }, 0);
}

export function deleteFile(tripId: string, attachment: Attachment): void {
  quiet(() => {
    const file = fileFor(tripId, attachment);
    if (file.exists) file.delete();
  }, undefined);
}

/** Every file currently on disk for this trip, whatever the itinerary now says. */
export function listTripFiles(tripId: string): File[] {
  return quiet(() => {
    const dir = tripDir(tripId);
    if (!dir.exists) return [];
    return dir.list().filter((entry): entry is File => entry instanceof File);
  }, []);
}

export function tripBytes(tripId: string): number {
  return listTripFiles(tripId).reduce((sum, file) => sum + quiet(() => file.size, 0), 0);
}

export function totalBytes(): number {
  return quiet(() => {
    const dir = root();
    if (!dir.exists) return 0;
    return dir.size ?? 0;
  }, 0);
}

export function removeTrip(tripId: string): void {
  quiet(() => {
    const dir = tripDir(tripId);
    if (dir.exists) dir.delete();
  }, undefined);
}

export function clearAll(): void {
  quiet(() => {
    const dir = root();
    if (dir.exists) dir.delete();
  }, undefined);
}
