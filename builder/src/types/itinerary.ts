/** Editor-side model. Mirrors schema/itinerary.schema.json, but every field is
 *  present and non-optional so form inputs never deal with undefined. Export
 *  strips the empty ones back out. */

export const ITEM_TYPES = [
  'sight',
  'food',
  'travel',
  'flight',
  'hotel',
  'activity',
  'rest',
  'note',
] as const;

export type ItemType = (typeof ITEM_TYPES)[number];

export const CONTACT_TYPES = ['phone', 'url', 'text'] as const;
export type ContactType = (typeof CONTACT_TYPES)[number];

export interface DraftImage {
  readonly id: string;
  url: string;
  caption: string;
  credit: string;
}

export interface DraftLocation {
  name: string;
  address: string;
  lat: string;
  lng: string;
  placeId: string;
  googleMapsUrl: string;
}

export interface DraftBlock {
  readonly id: string;
  time: string;
  endTime: string;
  title: string;
  type: ItemType;
  description: string;
  cost: string;
  bookingRef: string;
  bookingUrl: string;
  location: DraftLocation;
  images: DraftImage[];
}

export interface DraftDay {
  readonly id: string;
  date: string;
  base: string;
  title: string;
  summary: string;
  stayId: string;
  notes: string[];
  items: DraftBlock[];
  image: string;
}

export interface DraftStay {
  readonly id: string;
  key: string;
  name: string;
  city: string;
  address: string;
  checkIn: string;
  checkOut: string;
  phone: string;
  confirmation: string;
  notes: string;
  location: DraftLocation;
  image: string;
}

export interface DraftInfo {
  readonly id: string;
  title: string;
  body: string;
  image: string;
}

export interface DraftContact {
  readonly id: string;
  label: string;
  value: string;
  type: ContactType;
}

export interface DraftTrip {
  title: string;
  subtitle: string;
  startDate: string;
  endDate: string;
  timezone: string;
  currency: string;
  travellers: string[];
  coverImage: string;
}

export interface Draft {
  version: number;
  trip: DraftTrip;
  stays: DraftStay[];
  days: DraftDay[];
  info: DraftInfo[];
  contacts: DraftContact[];
}

export const ITEM_TYPE_META: Record<ItemType, { glyph: string; label: string }> = {
  sight: { glyph: '\u{1F5FA}', label: 'Sight' },
  food: { glyph: '\u{1F374}', label: 'Food' },
  travel: { glyph: '\u{1F686}', label: 'Travel' },
  flight: { glyph: '\u{2708}', label: 'Flight' },
  hotel: { glyph: '\u{1F3E8}', label: 'Hotel' },
  activity: { glyph: '\u{1F3AF}', label: 'Activity' },
  rest: { glyph: '\u{1F334}', label: 'Rest' },
  note: { glyph: '\u{1F4DD}', label: 'Note' },
};
