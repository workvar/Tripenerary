import { daysBetween, isDateKey } from '@/lib/dates';
import type { Draft, DraftDay } from '@/types/itinerary';

export interface DayProgress {
  readonly blocks: number;
  readonly done: boolean;
}

/** A day counts as planned once it has a title and at least one block. */
export const dayProgress = (day: DraftDay): DayProgress => ({
  blocks: day.items.filter((i) => i.title.trim()).length,
  done: day.title.trim().length > 0 && day.items.some((i) => i.title.trim()),
});

export interface TripStats {
  readonly days: number;
  readonly daysPlanned: number;
  readonly blocks: number;
  readonly stays: number;
  readonly notes: number;
  readonly infoSections: number;
  readonly pinned: number;
  readonly percent: number;
}

export function tripStats(draft: Draft): TripStats {
  const days = draft.days.length;
  const daysPlanned = draft.days.filter((d) => dayProgress(d).done).length;
  const blocks = draft.days.reduce((n, d) => n + dayProgress(d).blocks, 0);
  const pinned = draft.days.reduce(
    (n, d) => n + d.items.filter((i) => i.location.lat && i.location.lng).length,
    0
  );

  return {
    days,
    daysPlanned,
    blocks,
    stays: draft.stays.length,
    notes: draft.days.reduce((n, d) => n + d.notes.filter(Boolean).length, 0),
    infoSections: draft.info.length,
    pinned,
    percent: days === 0 ? 0 : Math.round((daysPlanned / days) * 100),
  };
}

export interface Issue {
  readonly level: 'error' | 'warning';
  readonly message: string;
}

export function validate(draft: Draft): readonly Issue[] {
  const issues: Issue[] = [];
  const push = (level: Issue['level'], message: string) => issues.push({ level, message });

  if (!draft.trip.title.trim()) push('error', 'Trip title is empty.');
  if (!isDateKey(draft.trip.startDate)) push('error', 'Trip start date must be YYYY-MM-DD.');
  if (!isDateKey(draft.trip.endDate)) push('error', 'Trip end date must be YYYY-MM-DD.');
  if (draft.days.length === 0) push('error', 'The trip has no days.');
  if (!draft.trip.timezone.trim()) push('warning', 'No timezone set, so "today" falls back to the phone clock.');

  const stayKeys = new Set(draft.stays.map((s) => s.key.trim()).filter(Boolean));
  const seenDates = new Set<string>();

  draft.days.forEach((day, i) => {
    const label = `Day ${i + 1}`;
    if (!isDateKey(day.date)) push('error', `${label}: date must be YYYY-MM-DD.`);
    else if (seenDates.has(day.date)) push('error', `${label}: duplicate date ${day.date}.`);
    else seenDates.add(day.date);

    if (day.stayId.trim() && !stayKeys.has(day.stayId.trim())) {
      push('error', `${label}: stay "${day.stayId}" does not exist.`);
    }
    if (day.items.length === 0) push('warning', `${label}: no blocks yet.`);
    day.items.forEach((item, j) => {
      if (!item.title.trim()) push('warning', `${label}, block ${j + 1}: no title, it will be skipped.`);
    });
  });

  const dupStay = draft.stays
    .map((s) => s.key.trim())
    .filter((k, i, all) => k && all.indexOf(k) !== i);
  if (dupStay.length > 0) push('error', `Duplicate stay id: ${[...new Set(dupStay)].join(', ')}.`);

  const first = draft.days[0]?.date;
  const last = draft.days[draft.days.length - 1]?.date;
  if (first && last && isDateKey(first) && isDateKey(last)) {
    if (draft.trip.startDate !== first) push('warning', `Trip start (${draft.trip.startDate}) is not the first day (${first}).`);
    if (draft.trip.endDate !== last) push('warning', `Trip end (${draft.trip.endDate}) is not the last day (${last}).`);
    if (daysBetween(first, last) + 1 !== draft.days.length) {
      push('warning', 'Dates are not consecutive, so the date strip will have gaps.');
    }
  }

  return issues;
}
