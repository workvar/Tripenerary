import type {
  Draft,
  DraftAttachment,
  DraftBlock,
  DraftContact,
  DraftDay,
  DraftEmergency,
  DraftEmergencyLocation,
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

export const newAttachment = (url = ''): DraftAttachment => ({
  id: uid('att'),
  url,
  title: '',
  kind: 'pdf',
  note: '',
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
  attachments: [],
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
  attachments: [],
});

export const newInfo = (): DraftInfo => ({ id: uid('info'), title: '', body: '', image: '' });

export const newContact = (): DraftContact => ({
  id: uid('con'),
  label: '',
  value: '',
  type: 'text',
});

export const newEmergencyLocation = (): DraftEmergencyLocation => ({
  id: uid('emb'),
  label: 'Embassy',
  name: '',
  address: '',
  phone: '',
  notes: '',
  location: emptyLocation(),
});

export const emptyEmergency = (): DraftEmergency => ({
  contacts: [],
  locations: [],
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
      attachments: [],
    },
    stays: [],
    days: [newDay(today)],
    info: [],
    contacts: [],
    emergency: emptyEmergency(),
  };
}
