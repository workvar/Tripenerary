import { uid } from '@/lib/factories';
import type { Draft } from '@/types/itinerary';

export type MergeMode = 'replace' | 'append' | 'days-only';

/** Fresh ids for everything, so an imported draft can sit beside the current one. */
export function rekeyDraft(draft: Draft): Draft {
  const rekeyAttachments = <T extends { id: string }>(list: T[]): T[] =>
    list.map((a) => ({ ...a, id: uid('att') }));

  return {
    ...draft,
    trip: { ...draft.trip, attachments: rekeyAttachments(draft.trip.attachments) },
    stays: draft.stays.map((s) => ({
      ...s,
      id: uid('stay'),
      attachments: rekeyAttachments(s.attachments),
    })),
    info: draft.info.map((i) => ({ ...i, id: uid('info') })),
    contacts: draft.contacts.map((c) => ({ ...c, id: uid('con') })),
    days: draft.days.map((d) => ({
      ...d,
      id: uid('day'),
      items: d.items.map((b) => ({
        ...b,
        id: uid('blk'),
        images: b.images.map((im) => ({ ...im, id: uid('img') })),
        attachments: rekeyAttachments(b.attachments),
      })),
    })),
  };
}

const byDate = (a: { date: string }, b: { date: string }) => a.date.localeCompare(b.date);

/**
 * `replace`   — the imported file becomes the whole trip.
 * `append`    — its days join the current trip, its stays and info are added
 *               where the ids do not already exist.
 * `days-only` — only the days come across, current settings stay untouched.
 */
export function mergeDraft(current: Draft, incoming: Draft, mode: MergeMode): Draft {
  const next = rekeyDraft(incoming);
  if (mode === 'replace') return next;

  const days = [...current.days, ...next.days].sort(byDate);

  if (mode === 'days-only') return { ...current, days };

  const stayKeys = new Set(current.stays.map((s) => s.key.trim()).filter(Boolean));
  const infoTitles = new Set(current.info.map((i) => i.title.trim().toLowerCase()));
  const contactKeys = new Set(current.contacts.map((c) => `${c.label}|${c.value}`.toLowerCase()));

  return {
    ...current,
    days,
    stays: [...current.stays, ...next.stays.filter((s) => !stayKeys.has(s.key.trim()))],
    info: [...current.info, ...next.info.filter((i) => !infoTitles.has(i.title.trim().toLowerCase()))],
    contacts: [
      ...current.contacts,
      ...next.contacts.filter((c) => !contactKeys.has(`${c.label}|${c.value}`.toLowerCase())),
    ],
  };
}

export interface ImportSummary {
  readonly days: number;
  readonly blocks: number;
  readonly stays: number;
  readonly info: number;
  readonly contacts: number;
  readonly title: string;
}

export const summarise = (draft: Draft): ImportSummary => ({
  title: draft.trip.title,
  days: draft.days.length,
  blocks: draft.days.reduce((n, d) => n + d.items.length, 0),
  stays: draft.stays.length,
  info: draft.info.length,
  contacts: draft.contacts.length,
});
