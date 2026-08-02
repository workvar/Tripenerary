import { daysBetween, todayKey } from './dates';
import type { Itinerary, TripDigest, TripRecord, TripState, TripStatus } from '@/types';

/** Compact, list-friendly description of a trip, cached in the index so the
 *  landing page can render instantly without parsing every payload. */
export function summarise(data: Itinerary | null): Partial<TripDigest> {
  if (!data) return {};
  return {
    title: data.trip.title,
    subtitle: data.trip.subtitle,
    coverImage: data.trip.coverImage || firstImage(data),
    startDate: data.trip.startDate,
    endDate: data.trip.endDate,
    timezone: data.trip.timezone,
    dayCount: data.days.length,
    places: derivePlaces(data),
  };
}

function firstImage(data: Itinerary): string {
  for (const day of data.days) {
    if (day.image) return day.image;
    const shot = day.items.find((item) => item.images.length > 0);
    if (shot?.images[0]) return shot.images[0].url;
  }
  return '';
}

function derivePlaces(data: Itinerary): string[] {
  const seen = new Set<string>();
  for (const day of data.days) {
    if (day.base) seen.add(day.base);
    if (seen.size === 4) break;
  }
  return [...seen];
}

/** Where the trip sits relative to today, plus a short label for the card badge. */
export function tripStatus(meta: Pick<TripRecord, 'startDate' | 'endDate' | 'timezone'>): TripStatus {
  const { startDate, endDate } = meta;
  if (!startDate || !endDate) return { state: 'upcoming', label: 'Not loaded' };

  const today = todayKey(meta.timezone);

  if (today < startDate) {
    const away = daysBetween(today, startDate);
    return { state: 'upcoming', label: away === 1 ? 'Tomorrow' : `In ${away} days` };
  }

  if (today > endDate) {
    const over = daysBetween(endDate, today);
    return { state: 'past', label: over === 1 ? 'Ended yesterday' : `${over} days ago` };
  }

  return { state: 'live', label: `Day ${daysBetween(startDate, today) + 1} · Now` };
}

const RANK: Record<TripState, number> = { live: 0, upcoming: 1, past: 2 };

/** Trips in the order people want them: happening now, then soonest, then past. */
export function sortTrips(trips: readonly TripRecord[]): TripRecord[] {
  return [...trips].sort((a, b) => {
    const rankA = RANK[tripStatus(a).state];
    const rankB = RANK[tripStatus(b).state];
    if (rankA !== rankB) return rankA - rankB;

    const startA = a.startDate ?? '';
    const startB = b.startDate ?? '';
    // Past trips read best most-recent-first; everything else soonest-first.
    return rankA === RANK.past ? startB.localeCompare(startA) : startA.localeCompare(startB);
  });
}
