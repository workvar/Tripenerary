/** Domain model. Everything here describes data *after* normalisation, so the
 *  UI never has to guard against missing fields. */

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

export const ATTACHMENT_KINDS = ['pdf', 'image', 'doc', 'ticket', 'link'] as const;
export type AttachmentKind = (typeof ATTACHMENT_KINDS)[number];

/** A plain `YYYY-MM-DD` string. Branded so a raw string cannot be passed by mistake. */
export type DateKey = string & { readonly __dateKey: unique symbol };

export interface TripImage {
  readonly url: string;
  readonly caption: string;
  readonly credit: string;
}

export interface TripLocation {
  readonly name: string;
  readonly address: string;
  readonly placeId: string;
  readonly googleMapsUrl: string;
  readonly lat?: number;
  readonly lng?: number;
}

export interface Booking {
  readonly ref: string;
  readonly url: string;
}

/** A linked document: boarding pass, hotel voucher, show ticket, insurance PDF. */
export interface Attachment {
  readonly key: string;
  readonly title: string;
  readonly url: string;
  readonly kind: AttachmentKind;
  readonly note: string;
}

export interface ScheduleItem {
  readonly key: string;
  readonly time: string;
  readonly endTime: string;
  readonly title: string;
  readonly type: ItemType;
  readonly description: string;
  readonly cost: string;
  readonly booking: Booking | null;
  readonly location: TripLocation | null;
  readonly images: readonly TripImage[];
  readonly attachments: readonly Attachment[];
}

export interface Stay {
  readonly id: string;
  readonly name: string;
  readonly city: string;
  readonly address: string;
  readonly checkIn: string;
  readonly checkOut: string;
  readonly phone: string;
  readonly confirmation: string;
  readonly notes: string;
  readonly location: TripLocation | null;
  readonly image: string;
  readonly attachments: readonly Attachment[];
}

export interface Day {
  readonly date: DateKey;
  readonly dayNumber: number;
  readonly base: string;
  readonly title: string;
  readonly summary: string;
  readonly stayId: string;
  readonly notes: readonly string[];
  readonly items: readonly ScheduleItem[];
  readonly image: string;
}

export interface TripMeta {
  readonly title: string;
  readonly subtitle: string;
  readonly startDate: DateKey;
  readonly endDate: DateKey;
  readonly timezone: string;
  readonly currency: string;
  readonly travellers: readonly string[];
  readonly coverImage: string;
  readonly attachments: readonly Attachment[];
}

export interface InfoSection {
  readonly title: string;
  readonly body: string;
  readonly image: string;
}

export interface Contact {
  readonly label: string;
  readonly value: string;
  readonly type: ContactType;
}

export interface EmergencyLocation {
  readonly label: string;
  readonly name: string;
  readonly address: string;
  readonly phone: string;
  readonly notes: string;
  readonly location: TripLocation | null;
}

export interface EmergencyInfo {
  readonly contacts: readonly Contact[];
  readonly locations: readonly EmergencyLocation[];
}

export interface Itinerary {
  readonly version: number;
  readonly trip: TripMeta;
  readonly stays: readonly Stay[];
  readonly staysById: Readonly<Record<string, Stay>>;
  readonly days: readonly Day[];
  readonly info: readonly InfoSection[];
  readonly contacts: readonly Contact[];
  readonly emergency: EmergencyInfo;
}

/* ---------- library ---------- */

/** Card-sized view of an itinerary, cached in the index so the home screen
 *  renders before any payload is parsed. */
export interface TripDigest {
  readonly title: string;
  readonly subtitle: string;
  readonly coverImage: string;
  readonly startDate: DateKey | '';
  readonly endDate: DateKey | '';
  readonly timezone: string;
  readonly dayCount: number;
  readonly places: readonly string[];
}

export interface TripRecord extends Partial<TripDigest> {
  readonly id: string;
  readonly url: string;
  readonly addedAt: string;
  readonly syncedAt: string | null;
}

export type TripState = 'live' | 'upcoming' | 'past';

export interface TripStatus {
  readonly state: TripState;
  readonly label: string;
}

export interface TripFetchState {
  readonly refreshing?: boolean;
  readonly error?: string | null;
}

export interface Prefs {
  readonly showMapPreview: boolean;
  readonly showImages: boolean;
  readonly autoRefreshOnLaunch: boolean;
}

/* ---------- results ---------- */

export type Failure = { readonly ok: false; readonly error: string };
export type Success<T> = { readonly ok: true; readonly value: T };

/** Discriminated result. Narrow on `.ok` before touching `.value` or `.error`. */
export type Result<T> = Success<T> | Failure;

export const ok = <T>(value: T): Success<T> => ({ ok: true, value });
export const fail = (error: string): Failure => ({ ok: false, error });

/** JSON straight off the network: shape unknown until `normalizeItinerary` runs. */
export type RawItinerary = unknown;
