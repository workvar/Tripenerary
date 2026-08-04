export interface PdfImage {
  readonly dataUrl: string;
  readonly format: 'PNG' | 'JPEG';
  readonly width: number;
  readonly height: number;
}

const TIMEOUT_MS = 6000;

const readDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('unreadable'));
    reader.readAsDataURL(blob);
  });

const measure = (src: string): Promise<{ width: number; height: number }> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error('undecodable'));
    img.src = src;
  });

/** Fetches a picture for embedding. Returns null on CORS blocks, dead links,
 *  slow servers or unsupported formats; the page then just prints without it. */
export async function loadImage(url: string): Promise<PdfImage | null> {
  const clean = url.trim();
  if (!/^https?:\/\//i.test(clean)) return null;

  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(clean, { mode: 'cors', signal: abort.signal });
    if (!res.ok) return null;

    const blob = await res.blob();
    const png = blob.type.includes('png');
    if (!png && !blob.type.includes('jpeg') && !blob.type.includes('jpg')) return null;

    const dataUrl = await readDataUrl(blob);
    const { width, height } = await measure(dataUrl);
    if (!width || !height) return null;

    return { dataUrl, format: png ? 'PNG' : 'JPEG', width, height };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Loads several pictures at once, keeping the misses as null. */
export async function loadImages(urls: readonly string[]): Promise<Map<string, PdfImage>> {
  const unique = [...new Set(urls.map((u) => u.trim()).filter(Boolean))];
  const results = await Promise.all(unique.map(loadImage));

  const map = new Map<string, PdfImage>();
  unique.forEach((url, i) => {
    const image = results[i];
    if (image) map.set(url, image);
  });
  return map;
}
