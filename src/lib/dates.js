// All dates are handled as plain 'YYYY-MM-DD' keys to avoid timezone drift.

export function todayKey(timezone) {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone || undefined,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  } catch (e) {
    return new Date().toISOString().slice(0, 10);
  }
}

function keyToUtcDate(key) {
  const [y, m, d] = String(key).split('-').map(Number);
  return new Date(Date.UTC(y, (m || 1) - 1, d || 1, 12));
}

export function isValidKey(key) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(key || ''));
}

export function formatDate(key, opts) {
  if (!isValidKey(key)) return String(key || '');
  return keyToUtcDate(key).toLocaleDateString('en-GB', { timeZone: 'UTC', ...opts });
}

export const weekdayShort = (key) => formatDate(key, { weekday: 'short' });
export const dayOfMonth = (key) => formatDate(key, { day: 'numeric' });
export const monthShort = (key) => formatDate(key, { month: 'short' });
export const longDate = (key) =>
  formatDate(key, { weekday: 'long', day: 'numeric', month: 'long' });

export function daysBetween(fromKey, toKey) {
  const a = keyToUtcDate(fromKey).getTime();
  const b = keyToUtcDate(toKey).getTime();
  return Math.round((b - a) / 86400000);
}

export function relativeLabel(key, today) {
  const diff = daysBetween(today, key);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff > 1) return 'In ' + diff + ' days';
  return Math.abs(diff) + ' days ago';
}

export function formatSyncedAt(iso) {
  if (!iso) return 'never';
  try {
    return new Date(iso).toLocaleString();
  } catch (e) {
    return iso;
  }
}
