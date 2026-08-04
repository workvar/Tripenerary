import { Linking } from 'react-native';
import { ATTACHMENT_KINDS, type Attachment, type AttachmentKind } from '@/types';

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

const isHttpUrl = (v: string): boolean => /^https?:\/\//i.test(v);

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null;

const isKind = (v: unknown): v is AttachmentKind =>
  typeof v === 'string' && (ATTACHMENT_KINDS as readonly string[]).includes(v);

const EXT_KIND: Readonly<Record<string, AttachmentKind>> = {
  pdf: 'pdf',
  png: 'image',
  jpg: 'image',
  jpeg: 'image',
  webp: 'image',
  heic: 'image',
  doc: 'doc',
  docx: 'doc',
  txt: 'doc',
  pkpass: 'ticket',
};

/** Strip the query string, then read whatever follows the final dot. */
function extensionOf(url: string): string {
  const path = url.split(/[?#]/)[0] ?? '';
  const last = path.split('/').pop() ?? '';
  const dot = last.lastIndexOf('.');
  return dot > 0 ? last.slice(dot + 1).toLowerCase() : '';
}

/** An explicit `kind` always wins; otherwise guess from the file extension. */
export function inferKind(url: string, hint: unknown): AttachmentKind {
  if (isKind(hint)) return hint;
  return EXT_KIND[extensionOf(url)] ?? 'link';
}

/** Fallback label when the author gave no title: the file name, or the host. */
function labelFromUrl(url: string): string {
  const path = url.split(/[?#]/)[0] ?? '';
  const file = decodeURIComponent(path.split('/').pop() ?? '');
  if (file && file.includes('.')) return file;
  return path.replace(/^https?:\/\//i, '').split('/')[0] ?? 'Document';
}

/**
 * Attachments may be written as a bare URL string, or as
 * `{ url, title, kind, note }`. Anything without a usable http(s) URL is dropped
 * so the UI never renders a row that cannot be opened.
 */
export function normAttachment(raw: unknown, index: number): Attachment | null {
  const source = typeof raw === 'string' ? { url: raw } : raw;
  if (!isRecord(source)) return null;

  const url = str(source['url'] ?? source['href'] ?? source['link']);
  if (!isHttpUrl(url)) return null;

  return {
    key: String(index),
    title: str(source['title'] ?? source['label'] ?? source['name']) || labelFromUrl(url),
    url,
    kind: inferKind(url, source['kind'] ?? source['type']),
    note: str(source['note'] ?? source['description']),
  };
}

export function normAttachments(raw: unknown): Attachment[] {
  const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return list.map(normAttachment).filter((a): a is Attachment => a !== null);
}

/**
 * Hand the URL to the OS so it lands in the right app: the system PDF viewer,
 * Wallet for a .pkpass, or the browser when nothing else claims it.
 */
export async function openAttachment(attachment: Attachment): Promise<boolean> {
  try {
    await Linking.openURL(attachment.url);
    return true;
  } catch {
    return false;
  }
}

export const ATTACHMENT_GLYPH: Readonly<Record<AttachmentKind, string>> = {
  pdf: '\u{1F4C4}',
  image: '\u{1F5BC}',
  doc: '\u{1F4DD}',
  ticket: '\u{1F3AB}',
  link: '\u{1F517}',
};

export const ATTACHMENT_LABEL: Readonly<Record<AttachmentKind, string>> = {
  pdf: 'PDF',
  image: 'Image',
  doc: 'Doc',
  ticket: 'Ticket',
  link: 'Link',
};
