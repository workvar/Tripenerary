import type { TripImage } from '@/types';

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

const isHttpUrl = (v: string): boolean => /^https?:\/\//i.test(v);

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null;

/**
 * Images may be written as a bare URL string, or as `{ url, caption, credit }`.
 *
 * Note there is deliberately no host rewriting here. An earlier version routed
 * Wikimedia links through an image proxy to dodge their 403, but the proxy was
 * refused too and turned a 403 into a 404 — a worse failure, further from the
 * cause. Choosing a host is a data decision: see scripts/set-image-host.mjs.
 */
export function normImage(raw: unknown): TripImage | null {
  if (typeof raw === 'string') {
    const url = raw.trim();
    return isHttpUrl(url) ? { url, caption: '', credit: '' } : null;
  }
  if (!isRecord(raw)) return null;

  const url = str(raw['url'] ?? raw['src'] ?? raw['uri']);
  if (!isHttpUrl(url)) return null;

  return { url, caption: str(raw['caption']), credit: str(raw['credit']) };
}

export function normImages(raw: unknown): TripImage[] {
  const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return list.map(normImage).filter((img): img is TripImage => img !== null);
}

/** Single-image fields (cover, day hero, stay photo) resolve to a plain URL. */
export function normImageUrl(raw: unknown): string {
  return normImage(raw)?.url ?? '';
}
