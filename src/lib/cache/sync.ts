import { cacheName } from './keys';
import { deleteFile, listTripFiles, removeTrip } from './files';
import { downloadAttachment, head } from './download';
import { dropRecords, dropTrip, entryKey, getRecord } from './manifest';
import type { Attachment, Itinerary } from '@/types';

/** Every document the itinerary currently points at, in one flat list. */
export function collectAttachments(data: Itinerary): Attachment[] {
  return [
    ...data.trip.attachments,
    ...data.stays.flatMap((s) => s.attachments),
    ...data.days.flatMap((d) => d.items.flatMap((i) => i.attachments)),
  ];
}

export interface SyncReport {
  readonly removed: number;
  readonly refreshed: number;
}

/** Both etag and length have to actually be known before they can disagree. */
function changed(
  info: { etag: string; length: number },
  record: { etag: string; length: number }
): boolean {
  if (info.etag && record.etag) return info.etag !== record.etag;
  if (info.length > 0 && record.length > 0) return info.length !== record.length;
  return false;
}

/**
 * Reconcile the cache with a freshly downloaded itinerary.
 *
 * Three things happen, in order:
 *
 * 1. **Delete** — files whose attachment is no longer in the itinerary, and any
 *    empty file left behind by a failed download, are removed.
 * 2. **Re-check** — each still-cached document is HEADed and compared against what
 *    it was when downloaded.
 * 3. **Fetch** — the ones that changed are pulled again.
 *
 * Documents that were never downloaded stay that way: they are fetched on first
 * tap, so a refresh never spends the traveller's data on files they may not open.
 * A failed HEAD leaves the cached copy alone, which is the right call on a bad
 * connection — a stale document beats no document.
 */
export async function syncTripCache(tripId: string, data: Itinerary): Promise<SyncReport> {
  const attachments = collectAttachments(data);
  const wanted = new Map<string, Attachment>(
    attachments.map((a) => [cacheName(a.url, a.kind), a])
  );

  let removed = 0;
  let refreshed = 0;
  const staleKeys: string[] = [];

  // 1. delete orphans and empty files
  for (const file of listTripFiles(tripId)) {
    const keep = wanted.get(file.name);
    const empty = keep ? file.size <= 0 : false;
    if (keep && !empty) continue;

    try {
      file.delete();
      removed += 1;
    } catch {
      // already gone, or not ours to remove
    }
    staleKeys.push(entryKey(tripId, file.name));
  }

  // 2 and 3. re-check what survived, re-fetch what moved on
  const survivors = listTripFiles(tripId);
  for (const file of survivors) {
    const attachment = wanted.get(file.name);
    if (!attachment) continue;

    const record = await getRecord(entryKey(tripId, file.name));
    if (!record) continue;

    const info = await head(attachment.url);
    if (!info || !changed(info, record)) continue;

    const result = await downloadAttachment(tripId, attachment);
    if (result.ok) refreshed += 1;
    else deleteFile(tripId, attachment);
  }

  await dropRecords(staleKeys);
  return { removed, refreshed };
}

/** Called when a trip leaves the library: drop its folder and its records together. */
export async function forgetTrip(tripId: string): Promise<void> {
  removeTrip(tripId);
  await dropTrip(tripId);
}
