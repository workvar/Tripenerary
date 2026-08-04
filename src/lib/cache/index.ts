/** Offline copies of attached documents. Downloaded on first tap, re-checked and
 *  swept whenever the itinerary they belong to is refreshed. */

export { formatBytes } from './keys';
export { isCached, cachedSize, totalBytes, tripBytes, clearAll as clearAllFiles } from './files';
export { downloadAttachment, localUri } from './download';
export { openCached, openRemote } from './open';
export { collectAttachments, forgetTrip, syncTripCache, type SyncReport } from './sync';

import { clearAll as clearAllFiles } from './files';
import { clearManifest } from './manifest';

/** Wipe every cached document across every trip. */
export async function clearDocumentCache(): Promise<void> {
  clearAllFiles();
  await clearManifest();
}
