import type {
  Availability,
  CreateOptions,
  LanguageModelFactory,
  LanguageModelSession,
} from '@/lib/ai/types';

/** Resolves whichever flavour of the Prompt API this browser exposes. */
export function getFactory(): LanguageModelFactory | null {
  if (typeof window === 'undefined') return null;
  return window.LanguageModel ?? window.ai?.languageModel ?? null;
}

export async function checkAvailability(): Promise<Availability> {
  const factory = getFactory();
  if (!factory) return 'unavailable';

  try {
    if (typeof factory.availability === 'function') return await factory.availability();

    if (typeof factory.capabilities === 'function') {
      const caps = await factory.capabilities();
      if (caps.available === 'readily') return 'available';
      if (caps.available === 'after-download') return 'downloadable';
      return 'unavailable';
    }
  } catch {
    return 'unavailable';
  }

  return 'unavailable';
}

const SYSTEM_PROMPT =
  'You write short, warm, concrete travel copy for a personal trip itinerary app. ' +
  'Reply with plain prose only: no markdown, no headings, no bullet points, no quotation ' +
  'marks around the answer, and no preamble such as "Here is". Never invent booking ' +
  'references, prices or opening hours that were not given to you.';

export interface SessionHandle {
  readonly session: LanguageModelSession;
  release(): void;
}

/** Creates a session, reporting model download progress as 0–1. */
export async function createSession(
  onProgress?: (fraction: number) => void,
  signal?: AbortSignal
): Promise<SessionHandle> {
  const factory = getFactory();
  if (!factory) throw new Error('Chrome built-in AI is not available in this browser.');

  const options: CreateOptions = {
    initialPrompts: [{ role: 'system', content: SYSTEM_PROMPT }],
    temperature: 0.8,
    topK: 3,
    signal,
    monitor: onProgress
      ? (m) => m.addEventListener('downloadprogress', (e) => onProgress(e.loaded))
      : undefined,
  };

  const session = await factory.create(options);
  return { session, release: () => session.destroy() };
}

/** Trims the model's habit of wrapping answers in quotes or a lead-in line. */
export function tidy(raw: string): string {
  return raw
    .trim()
    .replace(/^(here(?:'s| is)[^:]*:\s*)/i, '')
    .replace(/^["'“”]|["'“”]$/g, '')
    .replace(/^[*-]\s+/gm, '')
    .trim();
}
