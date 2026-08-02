import type { DateKey } from '@/types';

// All dates are handled as plain 'YYYY-MM-DD' keys to avoid timezone drift.

const KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isDateKey(value: unknown): value is DateKey {
  return typeof value === 'string' && KEY_PATTERN.test(value);
}

/** @deprecated prefer {@link isDateKey}; kept for the standalone validator. */
export const isValidKey = isDateKey;

export function todayKey(timezone?: string): DateKey {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone || undefined,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date()) as DateKey;
  } catch {
    return new Date().toISOString().slice(0, 10) as DateKey;
  }
}

function keyToUtcDate(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1, 12));
}

export function formatDate(key: string, opts?: Intl.DateTimeFormatOptions): string {
  if (!isDateKey(key)) return key || '';
  return keyToUtcDate(key).toLocaleDateString('en-GB', { timeZone: 'UTC', ...opts });
}

export const weekdayShort = (key: string): string => formatDate(key, { weekday: 'short' });
export const dayOfMonth = (key: string): string => formatDate(key, { day: 'numeric' });
export const monthShort = (key: string): string => formatDate(key, { month: 'short' });
export const longDate = (key: string): string =>
  formatDate(key, { weekday: 'long', day: 'numeric', month: 'long' });

export function daysBetween(fromKey: string, toKey: string): number {
  const a = keyToUtcDate(fromKey).getTime();
  const b = keyToUtcDate(toKey).getTime();
  return Math.round((b - a) / 86_400_000);
}

export function relativeLabel(key: string, today: string): string {
  const diff = daysBetween(today, key);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff > 1) return `In ${diff} days`;
  return `${Math.abs(diff)} days ago`;
}

export function formatSyncedAt(iso: string | null | undefined): string {
  if (!iso) return 'never';
  const at = new Date(iso);
  return Number.isNaN(at.getTime()) ? iso : at.toLocaleString();
}
