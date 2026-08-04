import { emptyLocation, newDraft, uid } from '@/lib/factories';
import type {
  Draft,
  DraftAttachment,
  DraftBlock,
  DraftContact,
  DraftDay,
  DraftImage,
  DraftInfo,
  DraftLocation,
  DraftStay,
} from '@/types/itinerary';

/** Drafts from localStorage or imported JSON may predate a field. Fill every
 *  gap so components can read `block.attachments` etc. without guards. */

type Obj = Record<string, unknown>;

const obj = (v: unknown): Obj => (v && typeof v === 'object' ? (v as Obj) : {});
const str = (v: unknown): string => (typeof v === 'string' ? v : '');
const list = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const strList = (v: unknown): string[] => list(v).map(str);

function location(v: unknown): DraftLocation {
  const o = obj(v);
  return {
    ...emptyLocation(),
    name: str(o.name),
    address: str(o.address),
    lat: str(o.lat),
    lng: str(o.lng),
    placeId: str(o.placeId),
    googleMapsUrl: str(o.googleMapsUrl),
  };
}

function image(v: unknown): DraftImage {
  const o = obj(v);
  return {
    id: str(o.id) || uid('img'),
    url: str(o.url),
    caption: str(o.caption),
    credit: str(o.credit),
  };
}

function attachment(v: unknown): DraftAttachment {
  const o = obj(v);
  const kind = str(o.kind);
  return {
    id: str(o.id) || uid('att'),
    url: str(o.url),
    title: str(o.title),
    kind: (['pdf', 'image', 'doc', 'ticket', 'link'].includes(kind)
      ? kind
      : 'pdf') as DraftAttachment['kind'],
    note: str(o.note),
  };
}

function block(v: unknown): DraftBlock {
  const o = obj(v);
  const type = str(o.type);
  return {
    id: str(o.id) || uid('blk'),
    time: str(o.time),
    endTime: str(o.endTime),
    title: str(o.title),
    type: (type || 'activity') as DraftBlock['type'],
    description: str(o.description),
    cost: str(o.cost),
    bookingRef: str(o.bookingRef),
    bookingUrl: str(o.bookingUrl),
    location: location(o.location),
    images: list(o.images).map(image),
    attachments: list(o.attachments).map(attachment),
  };
}

function day(v: unknown): DraftDay {
  const o = obj(v);
  return {
    id: str(o.id) || uid('day'),
    date: str(o.date),
    base: str(o.base),
    title: str(o.title),
    summary: str(o.summary),
    stayId: str(o.stayId),
    notes: strList(o.notes),
    items: list(o.items).map(block),
    image: str(o.image),
  };
}

function stay(v: unknown): DraftStay {
  const o = obj(v);
  return {
    id: str(o.id) || uid('stay'),
    key: str(o.key),
    name: str(o.name),
    city: str(o.city),
    address: str(o.address),
    checkIn: str(o.checkIn),
    checkOut: str(o.checkOut),
    phone: str(o.phone),
    confirmation: str(o.confirmation),
    notes: str(o.notes),
    location: location(o.location),
    image: str(o.image),
    attachments: list(o.attachments).map(attachment),
  };
}

function info(v: unknown): DraftInfo {
  const o = obj(v);
  return {
    id: str(o.id) || uid('info'),
    title: str(o.title),
    body: str(o.body),
    image: str(o.image),
  };
}

function contact(v: unknown): DraftContact {
  const o = obj(v);
  const type = str(o.type);
  return {
    id: str(o.id) || uid('con'),
    label: str(o.label),
    value: str(o.value),
    type: (['phone', 'url', 'text'].includes(type) ? type : 'text') as DraftContact['type'],
  };
}

export function normalizeDraft(v: unknown): Draft {
  const base = newDraft();
  const o = obj(v);
  const t = obj(o.trip);
  const days = list(o.days).map(day);

  return {
    version: typeof o.version === 'number' ? o.version : base.version,
    trip: {
      title: str(t.title) || base.trip.title,
      subtitle: str(t.subtitle),
      startDate: str(t.startDate) || base.trip.startDate,
      endDate: str(t.endDate) || base.trip.endDate,
      timezone: str(t.timezone),
      currency: str(t.currency),
      travellers: strList(t.travellers),
      coverImage: str(t.coverImage),
      attachments: list(t.attachments).map(attachment),
    },
    stays: list(o.stays).map(stay),
    days: days.length > 0 ? days : base.days,
    info: list(o.info).map(info),
    contacts: list(o.contacts).map(contact),
  };
}
