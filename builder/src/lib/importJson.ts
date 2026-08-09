import {
  emptyEmergency,
  emptyLocation,
  newAttachment,
  newBlock,
  newContact,
  newDay,
  newDraft,
  newEmergencyLocation,
  newImage,
  newInfo,
  newStay,
} from '@/lib/factories';
import { normalizeDraft } from '@/lib/normalizeDraft';
import { ITEM_TYPES, CONTACT_TYPES, ATTACHMENT_KINDS } from '@/types/itinerary';
import type {
  AttachmentKind,
  ContactType,
  Draft,
  DraftAttachment,
  DraftImage,
  DraftLocation,
  ItemType,
} from '@/types/itinerary';

type Json = Record<string, unknown>;

const obj = (v: unknown): Json => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Json) : {});
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const str = (v: unknown): string => (typeof v === 'string' ? v : typeof v === 'number' ? String(v) : '');

const itemType = (v: unknown): ItemType =>
  ITEM_TYPES.includes(v as ItemType) ? (v as ItemType) : 'activity';

const contactType = (v: unknown): ContactType =>
  CONTACT_TYPES.includes(v as ContactType) ? (v as ContactType) : 'text';

function readLocation(v: unknown): DraftLocation {
  const o = obj(v);
  return {
    ...emptyLocation(),
    name: str(o.name),
    address: str(o.address),
    lat: o.lat === undefined ? '' : str(o.lat),
    lng: o.lng === undefined ? '' : str(o.lng),
    placeId: str(o.placeId),
    googleMapsUrl: str(o.googleMapsUrl),
  };
}

/** Accepts a URL string, an { url, caption, credit } object, or an array of either. */
function readImages(v: unknown): DraftImage[] {
  const list = Array.isArray(v) ? v : v ? [v] : [];
  return list
    .map((entry) => {
      if (typeof entry === 'string') return { ...newImage(entry) };
      const o = obj(entry);
      const url = str(o.url) || str(o.src) || str(o.uri);
      if (!url) return null;
      return { ...newImage(url), caption: str(o.caption), credit: str(o.credit) };
    })
    .filter((i): i is DraftImage => i !== null);
}

const firstImageUrl = (v: unknown): string => readImages(v)[0]?.url ?? '';

/** Mirrors the app's inference so a bare URL round-trips with the same badge. */
const EXT_KIND: Record<string, AttachmentKind> = {
  pdf: 'pdf',
  png: 'image',
  jpg: 'image',
  jpeg: 'image',
  webp: 'image',
  heic: 'image',
  doc: 'doc',
  docx: 'doc',
  txt: 'doc',
  pkpass: 'ticket',
};

function attachmentKind(url: string, hint: unknown): AttachmentKind {
  if (ATTACHMENT_KINDS.includes(hint as AttachmentKind)) return hint as AttachmentKind;
  const file = (url.split(/[?#]/)[0] ?? '').split('/').pop() ?? '';
  const dot = file.lastIndexOf('.');
  const ext = dot > 0 ? file.slice(dot + 1).toLowerCase() : '';
  return EXT_KIND[ext] ?? 'link';
}

/** Accepts a URL string, an { url, title, kind, note } object, or an array of either. */
function readAttachments(v: unknown): DraftAttachment[] {
  const list = Array.isArray(v) ? v : v ? [v] : [];
  return list
    .map((entry) => {
      if (typeof entry === 'string') {
        return entry ? { ...newAttachment(entry), kind: attachmentKind(entry, undefined) } : null;
      }
      const o = obj(entry);
      const url = str(o.url) || str(o.href) || str(o.link);
      if (!url) return null;
      return {
        ...newAttachment(url),
        title: str(o.title) || str(o.label) || str(o.name),
        kind: attachmentKind(url, o.kind ?? o.type),
        note: str(o.note) || str(o.description),
      };
    })
    .filter((a): a is DraftAttachment => a !== null);
}

export function fromItinerary(raw: unknown): Draft {
  const root = obj(raw);
  const base = newDraft();
  const trip = obj(root.trip);

  const stays = arr(root.stays).map((entry) => {
    const o = obj(entry);
    return {
      ...newStay(),
      key: str(o.id),
      name: str(o.name),
      city: str(o.city),
      address: str(o.address),
      checkIn: str(o.checkIn),
      checkOut: str(o.checkOut),
      phone: str(o.phone),
      confirmation: str(o.confirmation),
      notes: str(o.notes),
      location: readLocation(o.location),
      image: firstImageUrl(o.image),
      attachments: readAttachments(o.attachments ?? o.documents),
    };
  });

  const days = arr(root.days).map((entry) => {
    const o = obj(entry);
    return {
      ...newDay(str(o.date)),
      base: str(o.base),
      title: str(o.title),
      summary: str(o.summary),
      stayId: str(o.stayId),
      notes: arr(o.notes).map(str).filter(Boolean),
      image: firstImageUrl(o.image),
      items: arr(o.items).map((raw) => {
        const i = obj(raw);
        const booking = obj(i.booking);
        return {
          ...newBlock(),
          time: str(i.time),
          endTime: str(i.endTime),
          title: str(i.title),
          type: itemType(i.type),
          description: str(i.description),
          cost: str(i.cost),
          bookingRef: str(booking.ref),
          bookingUrl: str(booking.url),
          location: readLocation(i.location),
          images: readImages(i.images),
          attachments: readAttachments(i.attachments ?? i.documents),
        };
      }),
    };
  });

  const info = arr(root.info).map((entry) => {
    const o = obj(entry);
    return { ...newInfo(), title: str(o.title), body: str(o.body), image: firstImageUrl(o.image) };
  });

  const contacts = arr(root.contacts).map((entry) => {
    const o = obj(entry);
    return { ...newContact(), label: str(o.label), value: str(o.value), type: contactType(o.type) };
  });

  const emergencyRoot = obj(root.emergency);
  const emergency = {
    contacts: arr(emergencyRoot.contacts).map((entry) => {
      const o = obj(entry);
      return { ...newContact(), label: str(o.label), value: str(o.value), type: contactType(o.type) };
    }),
    locations: arr(emergencyRoot.locations).map((entry) => {
      const o = obj(entry);
      return {
        ...newEmergencyLocation(),
        label: str(o.label) || 'Embassy',
        name: str(o.name),
        address: str(o.address),
        phone: str(o.phone),
        notes: str(o.notes),
        location: readLocation(o.location),
      };
    }),
  };

  return {
    version: typeof root.version === 'number' ? root.version : 1,
    trip: {
      title: str(trip.title) || base.trip.title,
      subtitle: str(trip.subtitle),
      startDate: str(trip.startDate) || base.trip.startDate,
      endDate: str(trip.endDate) || base.trip.endDate,
      timezone: str(trip.timezone),
      currency: str(trip.currency),
      travellers: arr(trip.travellers).map(str).filter(Boolean),
      coverImage: firstImageUrl(trip.coverImage),
      attachments: readAttachments(trip.attachments ?? trip.documents ?? root.attachments),
    },
    stays,
    days: days.length > 0 ? days : base.days,
    info,
    contacts,
    emergency:
      emergency.contacts.length > 0 || emergency.locations.length > 0 ? emergency : emptyEmergency(),
  };
}

export function parseDraft(text: string): { ok: true; draft: Draft } | { ok: false; error: string } {
  try {
    const draft = normalizeDraft(fromItinerary(JSON.parse(text)));
    return { ok: true, draft };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Could not read that file' };
  }
}
