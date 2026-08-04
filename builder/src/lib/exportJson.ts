import type { Draft, DraftAttachment, DraftImage, DraftLocation } from '@/types/itinerary';

type Json = Record<string, unknown>;

const clean = (s: string) => s.trim();

/** Drops keys whose value is empty, so the exported file stays close to the
 *  hand-written samples instead of being full of "". */
function compact(obj: Json): Json {
  const out: Json = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === '' || v === null || v === undefined) continue;
    if (Array.isArray(v) && v.length === 0) continue;
    if (typeof v === 'object' && !Array.isArray(v) && Object.keys(v as Json).length === 0) continue;
    out[k] = v;
  }
  return out;
}

function exportLocation(loc: DraftLocation): Json | undefined {
  const lat = Number.parseFloat(loc.lat);
  const lng = Number.parseFloat(loc.lng);

  const out = compact({
    name: clean(loc.name),
    address: clean(loc.address),
    lat: Number.isFinite(lat) ? lat : '',
    lng: Number.isFinite(lng) ? lng : '',
    placeId: clean(loc.placeId),
    googleMapsUrl: clean(loc.googleMapsUrl),
  });

  return Object.keys(out).length > 0 ? out : undefined;
}

/** A bare URL when there is nothing else to say, an object when there is. */
function exportImage(img: DraftImage): string | Json | undefined {
  const url = clean(img.url);
  if (!url) return undefined;
  if (!clean(img.caption) && !clean(img.credit)) return url;
  return compact({ url, caption: clean(img.caption), credit: clean(img.credit) });
}

function exportImages(images: DraftImage[]): unknown {
  const list = images.map(exportImage).filter((v) => v !== undefined);
  if (list.length === 0) return undefined;
  return list.length === 1 ? list[0] : list;
}

/** Attachments always export as objects: the kind badge is worth keeping explicit. */
function exportAttachments(attachments: DraftAttachment[]): unknown {
  const list = attachments
    .filter((a) => clean(a.url))
    .map((a) =>
      compact({
        url: clean(a.url),
        title: clean(a.title),
        kind: a.kind,
        note: clean(a.note),
      })
    );
  return list.length > 0 ? list : undefined;
}

export function toItinerary(draft: Draft): Json {
  const trip = compact({
    title: clean(draft.trip.title),
    subtitle: clean(draft.trip.subtitle),
    startDate: clean(draft.trip.startDate),
    endDate: clean(draft.trip.endDate),
    timezone: clean(draft.trip.timezone),
    currency: clean(draft.trip.currency),
    travellers: draft.trip.travellers.map(clean).filter(Boolean),
    coverImage: clean(draft.trip.coverImage),
    attachments: exportAttachments(draft.trip.attachments),
  });

  const stays = draft.stays
    .filter((s) => clean(s.name) || clean(s.key))
    .map((s) =>
      compact({
        id: clean(s.key) || s.id,
        name: clean(s.name),
        city: clean(s.city),
        address: clean(s.address),
        checkIn: clean(s.checkIn),
        checkOut: clean(s.checkOut),
        phone: clean(s.phone),
        confirmation: clean(s.confirmation),
        notes: clean(s.notes),
        location: exportLocation(s.location),
        image: clean(s.image),
        attachments: exportAttachments(s.attachments),
      })
    );

  const days = draft.days.map((d) =>
    compact({
      date: clean(d.date),
      base: clean(d.base),
      title: clean(d.title),
      summary: clean(d.summary),
      stayId: clean(d.stayId),
      notes: d.notes.map(clean).filter(Boolean),
      items: d.items
        .filter((i) => clean(i.title))
        .map((i) =>
          compact({
            time: clean(i.time),
            endTime: clean(i.endTime),
            title: clean(i.title),
            type: i.type,
            description: clean(i.description),
            cost: clean(i.cost),
            booking: compact({ ref: clean(i.bookingRef), url: clean(i.bookingUrl) }),
            location: exportLocation(i.location),
            images: exportImages(i.images),
            attachments: exportAttachments(i.attachments),
          })
        ),
      image: clean(d.image),
    })
  );

  const info = draft.info
    .filter((i) => clean(i.title) && clean(i.body))
    .map((i) => compact({ title: clean(i.title), body: clean(i.body), image: clean(i.image) }));

  const contacts = draft.contacts
    .filter((c) => clean(c.label) && clean(c.value))
    .map((c) => compact({ label: clean(c.label), value: clean(c.value), type: c.type }));

  return compact({ version: draft.version || 1, trip, stays, days, info, contacts });
}

export const toJsonString = (draft: Draft): string => JSON.stringify(toItinerary(draft), null, 2);

export function suggestedFilename(draft: Draft): string {
  const slug =
    clean(draft.trip.title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'itinerary';
  return `${slug}.json`;
}
