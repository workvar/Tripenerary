import { isValidKey } from './dates';

const ITEM_TYPES = [
  'sight', 'food', 'travel', 'flight', 'hotel', 'activity', 'rest', 'note',
];

export class ItineraryError extends Error {}

const str = (v) => (typeof v === 'string' ? v.trim() : '');
const arr = (v) => (Array.isArray(v) ? v : []);

function normLocation(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const lat = Number(raw.lat);
  const lng = Number(raw.lng);
  const loc = {
    name: str(raw.name),
    address: str(raw.address),
    placeId: str(raw.placeId),
    googleMapsUrl: str(raw.googleMapsUrl),
  };
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    loc.lat = lat;
    loc.lng = lng;
  }
  const hasAny = loc.name || loc.address || loc.googleMapsUrl || 'lat' in loc;
  return hasAny ? loc : null;
}

function normItem(raw, index) {
  const type = ITEM_TYPES.includes(raw.type) ? raw.type : 'activity';
  return {
    key: String(index),
    time: str(raw.time),
    endTime: str(raw.endTime),
    title: str(raw.title) || 'Untitled',
    type,
    description: str(raw.description),
    cost: str(raw.cost),
    booking: raw.booking && typeof raw.booking === 'object'
      ? { ref: str(raw.booking.ref), url: str(raw.booking.url) }
      : null,
    location: normLocation(raw.location),
  };
}

function normStay(raw) {
  return {
    id: str(raw.id),
    name: str(raw.name),
    city: str(raw.city),
    address: str(raw.address),
    checkIn: str(raw.checkIn),
    checkOut: str(raw.checkOut),
    phone: str(raw.phone),
    confirmation: str(raw.confirmation),
    notes: str(raw.notes),
    location: normLocation(raw.location),
  };
}

function normDay(raw, index) {
  return {
    date: str(raw.date),
    dayNumber: index + 1,
    base: str(raw.base),
    title: str(raw.title),
    summary: str(raw.summary),
    stayId: str(raw.stayId),
    notes: arr(raw.notes).map(str).filter(Boolean),
    items: arr(raw.items).map(normItem),
  };
}

export function normalizeItinerary(input) {
  if (!input || typeof input !== 'object') {
    throw new ItineraryError('The file is not a JSON object.');
  }
  if (!input.trip || typeof input.trip !== 'object') {
    throw new ItineraryError('Missing a "trip" object at the top level.');
  }
  if (!Array.isArray(input.days) || input.days.length === 0) {
    throw new ItineraryError('Missing a non-empty "days" array.');
  }

  const days = input.days
    .filter((d) => d && isValidKey(d.date))
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .map(normDay);

  if (days.length === 0) {
    throw new ItineraryError('No day had a valid "date" in YYYY-MM-DD format.');
  }

  const stays = arr(input.stays).map(normStay).filter((s) => s.id && s.name);
  const staysById = {};
  stays.forEach((s) => { staysById[s.id] = s; });

  return {
    version: Number(input.version) || 1,
    trip: {
      title: str(input.trip.title) || 'My trip',
      subtitle: str(input.trip.subtitle),
      startDate: str(input.trip.startDate) || days[0].date,
      endDate: str(input.trip.endDate) || days[days.length - 1].date,
      timezone: str(input.trip.timezone),
      currency: str(input.trip.currency),
      travellers: arr(input.trip.travellers).map(str).filter(Boolean),
    },
    stays,
    staysById,
    days,
    info: arr(input.info)
      .filter((i) => i && i.title && i.body)
      .map((i) => ({ title: str(i.title), body: str(i.body) })),
    contacts: arr(input.contacts)
      .filter((c) => c && c.label && c.value)
      .map((c) => ({ label: str(c.label), value: str(c.value), type: str(c.type) || 'text' })),
  };
}
