/** All dates are plain `YYYY-MM-DD` and parsed as UTC so the calendar day never
 *  shifts with the editor's local timezone. */

const MS_PER_DAY = 86_400_000;

export const isDateKey = (v: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(v);

export function parseKey(key: string): Date | null {
  if (!isDateKey(key)) return null;
  const d = new Date(`${key}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function addDays(key: string, delta: number): string {
  const d = parseKey(key);
  if (!d) return key;
  return new Date(d.getTime() + delta * MS_PER_DAY).toISOString().slice(0, 10);
}

export function daysBetween(a: string, b: string): number {
  const from = parseKey(a);
  const to = parseKey(b);
  if (!from || !to) return 0;
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

function parts(key: string): Intl.DateTimeFormatPart[] {
  const d = parseKey(key);
  if (!d) return [];
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).formatToParts(d);
}

const part = (key: string, name: string) => parts(key).find((p) => p.type === name)?.value ?? '';

export const weekdayShort = (key: string) => part(key, 'weekday');
export const dayOfMonth = (key: string) => part(key, 'day');
export const monthShort = (key: string) => part(key, 'month');

/** `Wed 12 Aug` for the day slider header. */
export function formatDayLabel(key: string): string {
  const d = parseKey(key);
  if (!d) return key || 'No date';
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(d);
}

export function longDate(key: string): string {
  const d = parseKey(key);
  if (!d) return key;
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(d);
}
