import type { AttachmentKind } from '@/types/itinerary';

export const DOC_GLYPH: Record<AttachmentKind, string> = {
  pdf: '\u{1F4C4}',
  image: '\u{1F5BC}',
  doc: '\u{1F4DD}',
  ticket: '\u{1F3AB}',
  link: '\u{1F517}',
};

export const DOC_LABEL: Record<AttachmentKind, string> = {
  pdf: 'PDF',
  image: 'Image',
  doc: 'Doc',
  ticket: 'Ticket',
  link: 'Link',
};

/** Same fallback the app uses when an attachment has no title. */
export function fileLabel(url: string): string {
  const path = url.split(/[?#]/)[0] ?? '';
  const file = decodeURIComponent(path.split('/').pop() ?? '');
  if (file && file.includes('.')) return file;
  return path.replace(/^https?:\/\//i, '').split('/')[0] ?? 'Document';
}
