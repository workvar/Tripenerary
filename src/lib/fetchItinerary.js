import { FETCH_TIMEOUT_MS } from '../config';
import { ItineraryError } from './normalize';

// Rewrites common share links into direct-download links.
export function resolveUrl(input) {
  const url = String(input || '').trim();
  if (!url) throw new ItineraryError('No link provided.');
  if (!/^https?:\/\//i.test(url)) {
    throw new ItineraryError('The link must start with http:// or https://');
  }

  const gh = url.match(/^https:\/\/github\.com\/(.+?)\/blob\/(.+)$/);
  if (gh) return 'https://raw.githubusercontent.com/' + gh[1] + '/' + gh[2];

  const gistPage = url.match(/^https:\/\/gist\.github\.com\/([^/]+)\/([a-f0-9]+)$/i);
  if (gistPage) return url + '/raw';

  const drive = url.match(/^https:\/\/drive\.google\.com\/file\/d\/([^/]+)/);
  if (drive) return 'https://drive.google.com/uc?export=download&id=' + drive[1];

  const dropbox = url.match(/^https:\/\/www\.dropbox\.com\/(.+)$/);
  if (dropbox) return url.replace(/[?&]dl=0/, '') + (url.includes('?') ? '&' : '?') + 'dl=1';

  return url;
}

export async function fetchItinerary(rawUrl) {
  const url = resolveUrl(rawUrl);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let res;
  try {
    res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
  } catch (e) {
    clearTimeout(timer);
    throw new ItineraryError(
      e.name === 'AbortError'
        ? 'The request timed out. Check the connection and try again.'
        : 'Could not reach that link. Check the connection and the URL.'
    );
  }
  clearTimeout(timer);

  if (!res.ok) {
    throw new ItineraryError('The server returned ' + res.status + '. Is the link public?');
  }

  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new ItineraryError(
      'That link did not return valid JSON. Make sure it points at the raw file, not a preview page.'
    );
  }
}
