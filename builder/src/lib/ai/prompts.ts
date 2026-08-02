/** Prompt builders. Each one turns whatever the user has already typed into a
 *  tight brief, so the model describes their trip rather than a generic one. */

export type AiKind = 'block' | 'day' | 'trip' | 'stay';

export interface AiRequest {
  readonly kind: AiKind;
  /** Label → value. Empty values are dropped before the prompt is built. */
  readonly facts: Record<string, string | undefined>;
  /** Existing text, if the user wants a rewrite rather than a first draft. */
  readonly existing?: string;
}

const BRIEF: Record<AiKind, string> = {
  block:
    'Write the description for one item on a day of the trip. Two or three sentences. ' +
    'Say what happens, roughly how long it takes, and one practical tip.',
  day:
    'Write the one-line summary for a day of the trip. A single sentence, under 25 words, ' +
    'that captures the shape and mood of the day.',
  trip:
    'Write the subtitle for the whole trip. One short line, under 12 words. ' +
    'Usually the places visited or the feeling of the trip. No dates.',
  stay:
    'Write the notes for a place the travellers are staying. Two sentences on what the ' +
    'place is like and one thing worth knowing on arrival.',
};

function factLines(facts: Record<string, string | undefined>): string {
  return Object.entries(facts)
    .filter((entry): entry is [string, string] => Boolean(entry[1]?.trim()))
    .map(([key, value]) => `${key}: ${value.trim()}`)
    .join('\n');
}

export function buildPrompt({ kind, facts, existing }: AiRequest): string {
  const known = factLines(facts);
  const parts = [BRIEF[kind]];

  parts.push(known ? `What I already know:\n${known}` : 'I have not filled in any details yet.');

  if (existing?.trim()) {
    parts.push(`Rewrite this so it reads better, keeping every fact intact:\n${existing.trim()}`);
  }

  parts.push('Reply with the text only.');
  return parts.join('\n\n');
}

/** Not enough context means the model would just make things up. */
export function hasEnoughContext(facts: Record<string, string | undefined>): boolean {
  return Object.values(facts).some((v) => (v ?? '').trim().length > 1);
}
