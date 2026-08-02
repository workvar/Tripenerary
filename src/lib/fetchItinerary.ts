import { FETCH_TIMEOUT_MS } from '@/config';
import { ItineraryError } from './normalize';
import type { RawItinerary } from '@/types';

/** Rewrites common share links into direct-download links. */
export function resolveUrl(input: string): string {
  const url = input.trim();
  if (!url) throw new ItineraryError('No link provided.');
  if (!/^https?:\/\//i.test(url)) {
    throw new ItineraryError('The link must start with http:// or https://');
  }

  const gh = /^https:\/\/github\.com\/(.+?)\/blob\/(.+)$/.exec(url);
  if (gh) return `https://raw.githubusercontent.com/${gh[1]}/${gh[2]}`;

  const gist = /^https:\/\/gist\.github\.com\/[^/]+\/[a-f0-9]+$/i.test(url);
  if (gist) return `${url}/raw`;

  const drive = /^https:\/\/drive\.google\.com\/file\/d\/([^/]+)/.exec(url);
  if (drive) return `https://drive.google.com/uc?export=download&id=${drive[1]}`;

  if (/^https:\/\/www\.dropbox\.com\//.test(url)) {
    const stripped = url.replace(/[?&]dl=0/, '');
    return `${stripped}${stripped.includes('?') ? '&' : '?'}dl=1`;
  }

  return url;
}

export async function fetchItinerary(rawUrl: string): Promise<RawItinerary> {
  const url = resolveUrl(rawUrl);

  // React Native's AbortController has no static `timeout` helper, so wire one up.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
  } catch (e) {
    const timedOut = e instanceof Error && (e.name === 'TimeoutError' || e.name === 'AbortError');
    throw new ItineraryError(
      timedOut
        ? 'The request timed out. Check the connection and try again.'
        : 'Could not reach that link. Check the connection and the URL.'
    );
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    throw new ItineraryError(`The server returned ${res.status}. Is the link public?`);
  }

  const text = await res.text();
  try {
    return JSON.parse(text) as RawItinerary;
  } catch {
    throw new ItineraryError(
      'That link did not return valid JSON. Make sure it points at the raw file, not a preview page.'
    );
  }
}
