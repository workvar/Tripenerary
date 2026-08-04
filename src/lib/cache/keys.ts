import type { AttachmentKind } from '@/types';

/** Default extension per kind, used when the URL carries none of its own.
 *  Android picks the viewer from the extension, so guessing badly is worse than
 *  guessing generically. */
const KIND_EXTENSION: Readonly<Record<AttachmentKind, string>> = {
  pdf: 'pdf',
  image: 'jpg',
  doc: 'txt',
  ticket: 'pkpass',
  link: 'bin',
};

/**
 * djb2 over the URL. Not cryptographic, and it does not need to be: the only
 * job is a short, stable, filesystem-safe name per URL. A collision would show
 * one document in place of another, which a re-check corrects on next refresh.
 */
function hash(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i += 1) {
    h = ((h << 5) + h + input.charCodeAt(i)) | 0;
  }
  // Length is mixed in so two URLs that hash alike still differ.
  return `${(h >>> 0).toString(36)}${input.length.toString(36)}`;
}

/** Only a short alphanumeric run counts; query strings and paths are stripped first. */
function extensionOf(url: string): string {
  const path = url.split(/[?#]/)[0] ?? '';
  const last = path.split('/').pop() ?? '';
  const dot = last.lastIndexOf('.');
  if (dot <= 0) return '';
  const ext = last.slice(dot + 1).toLowerCase();
  return /^[a-z0-9]{1,8}$/.test(ext) ? ext : '';
}

/** The on-disk name for a document. Deterministic, so the same URL always maps
 *  to the same file and re-downloads overwrite in place. */
export function cacheName(url: string, kind: AttachmentKind): string {
  return `${hash(url)}.${extensionOf(url) || KIND_EXTENSION[kind]}`;
}

export function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 MB';
  if (bytes < 1024 * 1024) return `${Math.max(Math.round(bytes / 1024), 1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(bytes < 10 * 1024 * 1024 ? 1 : 0)} MB`;
}
