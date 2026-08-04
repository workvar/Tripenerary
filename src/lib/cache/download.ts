import { File } from 'expo-file-system';
import { DOCUMENT_CACHE, DOCUMENT_HEADERS, FETCH_TIMEOUT_MS } from '@/config';
import { cacheName, formatBytes } from './keys';
import { deleteFile, ensureTripDir, fileFor, tripBytes } from './files';
import { entryKey, putRecord } from './manifest';
import { fail, ok, type Attachment, type Result } from '@/types';

export interface HeadInfo {
  readonly etag: string;
  readonly length: number;
}

/**
 * Ask the server what the file is before pulling it down. Used twice: to reject
 * an oversized document before it costs the traveller any data, and on refresh
 * to spot a document that changed since it was cached.
 *
 * A server that refuses HEAD is not an error; we just learn nothing and proceed.
 */
export async function head(url: string): Promise<HeadInfo | null> {
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      headers: DOCUMENT_HEADERS,
      redirect: 'follow',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    return {
      etag: res.headers.get('etag') ?? res.headers.get('last-modified') ?? '',
      length: Number(res.headers.get('content-length')) || 0,
    };
  } catch {
    return null;
  }
}

const tooBig = (bytes: number): string =>
  `That document is ${formatBytes(bytes)}, over the ${formatBytes(
    DOCUMENT_CACHE.maxFileBytes
  )} limit for offline copies.`;

/**
 * Download one attachment into the trip's cache folder and record what it was.
 *
 * Returns the local `file://` URI on success. Both caps are enforced before the
 * transfer where the server told us the size, and again afterwards where it did
 * not — an oversized file that slipped through is deleted rather than kept.
 */
export async function downloadAttachment(
  tripId: string,
  attachment: Attachment
): Promise<Result<string>> {
  const info = await head(attachment.url);

  if (info && info.length > DOCUMENT_CACHE.maxFileBytes) {
    return fail(tooBig(info.length));
  }
  if (info && tripBytes(tripId) + info.length > DOCUMENT_CACHE.maxTripBytes) {
    return fail(
      `This trip has reached its ${formatBytes(
        DOCUMENT_CACHE.maxTripBytes
      )} of offline documents. Clear downloads in Settings to make room.`
    );
  }

  const dir = ensureTripDir(tripId);
  const name = cacheName(attachment.url, attachment.kind);

  try {
    const file = new File(dir, name);
    await File.downloadFileAsync(attachment.url, file, {
      headers: DOCUMENT_HEADERS,
      idempotent: true,
    });

    const size = file.exists ? file.size : 0;
    if (size <= 0) {
      deleteFile(tripId, attachment);
      return fail('The download finished empty. The link may no longer work.');
    }
    if (size > DOCUMENT_CACHE.maxFileBytes) {
      deleteFile(tripId, attachment);
      return fail(tooBig(size));
    }

    await putRecord(entryKey(tripId, name), {
      url: attachment.url,
      etag: info?.etag ?? '',
      length: size,
      fetchedAt: new Date().toISOString(),
    });

    return ok(file.uri);
  } catch {
    deleteFile(tripId, attachment);
    return fail('Could not download that document.');
  }
}

/** The cached copy's local URI, or null when it is not on disk. */
export function localUri(tripId: string, attachment: Attachment): string | null {
  try {
    const file = fileFor(tripId, attachment);
    return file.exists && file.size > 0 ? file.uri : null;
  } catch {
    return null;
  }
}
