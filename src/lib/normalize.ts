import { isDateKey } from './dates';
import { normImages, normImageUrl } from './images';
import {
  CONTACT_TYPES,
  ITEM_TYPES,
  type Contact,
  type ContactType,
  type Day,
  type InfoSection,
  type Itinerary,
  type ItemType,
  type ScheduleItem,
  type Stay,
  type TripLocation,
} from '@/types';

export class ItineraryError extends Error {
  override readonly name = 'ItineraryError';
}

type Rec = Record<string, unknown>;

const isRecord = (v: unknown): v is Rec => typeof v === 'object' && v !== null;
const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const rec = (v: unknown): Rec => (isRecord(v) ? v : {});

const isItemType = (v: unknown): v is ItemType =>
  typeof v === 'string' && (ITEM_TYPES as readonly string[]).includes(v);

const isContactType = (v: unknown): v is ContactType =>
  typeof v === 'string' && (CONTACT_TYPES as readonly string[]).includes(v);

function normLocation(raw: unknown): TripLocation | null {
  if (!isRecord(raw)) return null;

  const lat = Number(raw['lat']);
  const lng = Number(raw['lng']);
  const pinned = Number.isFinite(lat) && Number.isFinite(lng);

  const loc: TripLocation = {
    name: str(raw['name']),
    address: str(raw['address']),
    placeId: str(raw['placeId']),
    googleMapsUrl: str(raw['googleMapsUrl']),
    ...(pinned ? { lat, lng } : {}),
  };

  const usable = loc.name || loc.address || loc.googleMapsUrl || pinned;
  return usable ? loc : null;
}

function normItem(raw: unknown, index: number): ScheduleItem {
  const it = rec(raw);
  const booking = isRecord(it['booking'])
    ? { ref: str(it['booking']['ref']), url: str(it['booking']['url']) }
    : null;

  return {
    key: String(index),
    time: str(it['time']),
    endTime: str(it['endTime']),
    title: str(it['title']) || 'Untitled',
    type: isItemType(it['type']) ? it['type'] : 'activity',
    description: str(it['description']),
    cost: str(it['cost']),
    booking,
    location: normLocation(it['location']),
    images: normImages(it['images'] ?? it['image']),
  };
}

function normStay(raw: unknown): Stay {
  const st = rec(raw);
  return {
    id: str(st['id']),
    name: str(st['name']),
    city: str(st['city']),
    address: str(st['address']),
    checkIn: str(st['checkIn']),
    checkOut: str(st['checkOut']),
    phone: str(st['phone']),
    confirmation: str(st['confirmation']),
    notes: str(st['notes']),
    location: normLocation(st['location']),
    image: normImageUrl(st['image']),
  };
}

function normDay(raw: unknown, index: number): Day {
  const d = rec(raw);
  const date = d['date'];
  if (!isDateKey(date)) {
    throw new ItineraryError('Internal: day passed validation without a date key.');
  }

  return {
    date,
    dayNumber: index + 1,
    base: str(d['base']),
    title: str(d['title']),
    summary: str(d['summary']),
    stayId: str(d['stayId']),
    notes: arr(d['notes']).map(str).filter(Boolean),
    items: arr(d['items']).map(normItem),
    image: normImageUrl(d['image']),
  };
}

function normInfo(raw: unknown): InfoSection | null {
  const i = rec(raw);
  const title = str(i['title']);
  const body = str(i['body']);
  return title && body ? { title, body, image: normImageUrl(i['image']) } : null;
}

function normContact(raw: unknown): Contact | null {
  const c = rec(raw);
  const label = str(c['label']);
  const value = str(c['value']);
  if (!label || !value) return null;
  return { label, value, type: isContactType(c['type']) ? c['type'] : 'text' };
}

export function normalizeItinerary(input: unknown): Itinerary {
  if (!isRecord(input)) {
    throw new ItineraryError('The file is not a JSON object.');
  }
  if (!isRecord(input['trip'])) {
    throw new ItineraryError('Missing a "trip" object at the top level.');
  }
  if (!Array.isArray(input['days']) || input['days'].length === 0) {
    throw new ItineraryError('Missing a non-empty "days" array.');
  }

  const days = input['days']
    .filter((d): d is Rec => isRecord(d) && isDateKey(d['date']))
    .sort((a, b) => String(a['date']).localeCompare(String(b['date'])))
    .map(normDay);

  const first = days[0];
  const last = days[days.length - 1];
  if (!first || !last) {
    throw new ItineraryError('No day had a valid "date" in YYYY-MM-DD format.');
  }

  const stays = arr(input['stays'])
    .map(normStay)
    .filter((s) => s.id && s.name);

  const staysById = Object.fromEntries(stays.map((s) => [s.id, s]));
  const trip = input['trip'];
  const startDate = trip['startDate'];
  const endDate = trip['endDate'];

  return {
    version: Number(input['version']) || 1,
    trip: {
      title: str(trip['title']) || 'My trip',
      subtitle: str(trip['subtitle']),
      startDate: isDateKey(startDate) ? startDate : first.date,
      endDate: isDateKey(endDate) ? endDate : last.date,
      timezone: str(trip['timezone']),
      currency: str(trip['currency']),
      travellers: arr(trip['travellers']).map(str).filter(Boolean),
      coverImage: normImageUrl(trip['coverImage'] ?? trip['image']),
    },
    stays,
    staysById,
    days,
    info: arr(input['info'])
      .map(normInfo)
      .filter((i): i is InfoSection => i !== null),
    contacts: arr(input['contacts'])
      .map(normContact)
      .filter((c): c is Contact => c !== null),
  };
}
