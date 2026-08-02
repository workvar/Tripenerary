import { daysBetween, todayKey } from './dates';

// Compact, list-friendly description of a trip, cached in the index so the
// landing page can render instantly without parsing every payload.
export function summarise(data) {
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

function firstImage(data) {
  for (const day of data.days) {
    if (day.image) return day.image;
    for (const item of day.items) {
      if (item.images && item.images.length) return item.images[0].url;
    }
  }
  return '';
}

function derivePlaces(data) {
  const seen = [];
  data.days.forEach((d) => {
    if (d.base && !seen.includes(d.base)) seen.push(d.base);
  });
  return seen.slice(0, 4);
}

// 'upcoming' | 'live' | 'past', plus a short human label for the card badge.
export function tripStatus(meta) {
  const today = todayKey(meta && meta.timezone);
  if (!meta || !meta.startDate || !meta.endDate) {
    return { state: 'upcoming', label: 'Not loaded' };
  }
  if (today < meta.startDate) {
    const away = daysBetween(today, meta.startDate);
    if (away === 1) return { state: 'upcoming', label: 'Tomorrow' };
    return { state: 'upcoming', label: 'In ' + away + ' days' };
  }
  if (today > meta.endDate) {
    const over = daysBetween(meta.endDate, today);
    if (over === 1) return { state: 'past', label: 'Ended yesterday' };
    return { state: 'past', label: over + ' days ago' };
  }
  const dayNo = daysBetween(meta.startDate, today) + 1;
  return { state: 'live', label: 'Day ' + dayNo + ' · Now' };
}

// Trips in the order people want them: happening now, then soonest, then past.
export function sortTrips(trips) {
  const rank = { live: 0, upcoming: 1, past: 2 };
  return [...trips].sort((a, b) => {
    const ra = rank[tripStatus(a).state];
    const rb = rank[tripStatus(b).state];
    if (ra !== rb) return ra - rb;
    const sa = a.startDate || '';
    const sb = b.startDate || '';
    if (sa === sb) return 0;
    return ra === 2 ? (sa > sb ? -1 : 1) : sa < sb ? -1 : 1;
  });
}
