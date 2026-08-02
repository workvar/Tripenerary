import type {
  Draft,
  DraftBlock,
  DraftContact,
  DraftDay,
  DraftImage,
  DraftInfo,
  DraftLocation,
  DraftStay,
} from '@/types/itinerary';

let counter = 0;

/** Stable enough for React keys and short enough to read in dev tools. */
export function uid(prefix = 'x'): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}_${counter.toString(36)}`;
}

export const emptyLocation = (): DraftLocation => ({
  name: '',
  address: '',
  lat: '',
  lng: '',
  placeId: '',
  googleMapsUrl: '',
});

export const newImage = (url = ''): DraftImage => ({
  id: uid('img'),
  url,
  caption: '',
  credit: '',
});

export const newBlock = (): DraftBlock => ({
  id: uid('blk'),
  time: '',
  endTime: '',
  title: '',
  type: 'activity',
  description: '',
  cost: '',
  bookingRef: '',
  bookingUrl: '',
  location: emptyLocation(),
  images: [],
});

export const newDay = (date: string): DraftDay => ({
  id: uid('day'),
  date,
  base: '',
  title: '',
  summary: '',
  stayId: '',
  notes: [],
  items: [],
  image: '',
});

export const newStay = (): DraftStay => ({
  id: uid('stay'),
  key: '',
  name: '',
  city: '',
  address: '',
  checkIn: '',
  checkOut: '',
  phone: '',
  confirmation: '',
  notes: '',
  location: emptyLocation(),
  image: '',
});

export const newInfo = (): DraftInfo => ({ id: uid('info'), title: '', body: '', image: '' });

export const newContact = (): DraftContact => ({
  id: uid('con'),
  label: '',
  value: '',
  type: 'text',
});

export function newDraft(): Draft {
  const today = new Date().toISOString().slice(0, 10);
  return {
    version: 1,
    trip: {
      title: 'Untitled trip',
      subtitle: '',
      startDate: today,
      endDate: today,
      timezone: '',
      currency: '',
      travellers: [],
      coverImage: '',
    },
    stays: [],
    days: [newDay(today)],
    info: [],
    contacts: [],
  };
}
