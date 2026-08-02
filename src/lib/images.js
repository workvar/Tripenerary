const str = (v) => (typeof v === 'string' ? v.trim() : '');

const isUrl = (v) => /^https?:\/\//i.test(v);

// Images may be written as a bare URL string or as { url, caption, credit }.
export function normImage(raw) {
  if (typeof raw === 'string') {
    const url = str(raw);
    return isUrl(url) ? { url, caption: '', credit: '' } : null;
  }
  if (!raw || typeof raw !== 'object') return null;
  const url = str(raw.url || raw.src || raw.uri);
  if (!isUrl(url)) return null;
  return { url, caption: str(raw.caption), credit: str(raw.credit) };
}

export function normImages(raw) {
  const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return list.map(normImage).filter(Boolean);
}

// Single-image fields (cover, day hero, stay photo) resolve to a plain URL.
export function normImageUrl(raw) {
  const img = normImage(raw);
  return img ? img.url : '';
}
