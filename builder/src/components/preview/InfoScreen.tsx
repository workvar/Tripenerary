'use client';

import { DOC_GLYPH, DOC_LABEL, fileLabel } from '@/lib/attachmentMeta';
import type { Draft, DraftAttachment } from '@/types/itinerary';

function DocRows({ attachments, label }: { readonly attachments: DraftAttachment[]; readonly label: string }) {
  const docs = attachments.filter((a) => a.url.trim());
  if (docs.length === 0) return null;
  return (
    <div className="mb-4">
      <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[1.1px] text-accent">{label}</h3>
      <div className="space-y-2 overflow-hidden rounded-lg border border-lineSoft bg-white p-3 shadow-sm">
        {docs.map((d) => (
          <div key={d.id} className="flex items-center gap-3 rounded-sm border border-line bg-elevated px-3 py-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xs bg-primarySoft text-sm">
              {DOC_GLYPH[d.kind]}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[15px] font-bold text-ink">
                {d.title || fileLabel(d.url)}
              </span>
              <span className="block truncate text-[11.5px] text-faint">{d.note || DOC_LABEL[d.kind]}</span>
            </span>
            <span className="text-[15px] text-faint">{'\u{203A}'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** The trip info screen: emergency, documents, contacts, stays, practical sections. */
export default function InfoScreen({ draft }: { readonly draft: Draft }) {
  const sections = draft.info.filter((i) => i.title.trim() || i.body.trim());
  const contacts = draft.contacts.filter((c) => c.label.trim() || c.value.trim());
  const emergencyContacts = draft.emergency.contacts.filter((c) => c.label.trim() || c.value.trim());
  const emergencyPlaces = draft.emergency.locations.filter(
    (l) => l.name.trim() || l.address.trim() || l.phone.trim()
  );
  const tripDocs = draft.trip.attachments.filter((a) => a.url.trim());
  const empty =
    sections.length === 0 &&
    contacts.length === 0 &&
    emergencyContacts.length === 0 &&
    emergencyPlaces.length === 0 &&
    tripDocs.length === 0 &&
    draft.stays.length === 0;

  return (
    <>
      <div className="shrink-0 bg-primary px-4 pb-3 pt-4">
        <div className="flex items-center gap-2">
          <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white/15 text-white">
            {'\u{2039}'}
          </span>
          <div className="text-[17px] font-extrabold tracking-tight text-white">Trip info</div>
        </div>
      </div>

      <div className="phone-scroll flex-1 overflow-y-auto px-4 py-4">
        {empty ? (
          <p className="py-20 text-center text-sm text-faint">
            Nothing written yet. Add emergency info, contacts, or documents in the Info and Trip tabs.
          </p>
        ) : null}

        {emergencyContacts.length > 0 || emergencyPlaces.length > 0 ? (
          <div className="mb-4">
            <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[1.1px] text-accent">Emergency</h3>
            {emergencyContacts.length > 0 ? (
              <div className="mb-3 overflow-hidden rounded-lg border border-lineSoft bg-white shadow-sm">
                {emergencyContacts.map((c, i) => (
                  <div
                    key={c.id}
                    className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t border-lineSoft' : ''}`}
                  >
                    <span className="flex-1 text-[15px] text-ink">{c.label}</span>
                    <span className="text-[13px] font-bold text-primary">{c.value}</span>
                  </div>
                ))}
              </div>
            ) : null}
            {emergencyPlaces.map((place) => (
              <div key={place.id} className="mb-3 overflow-hidden rounded-lg border border-lineSoft bg-white p-4 shadow-sm">
                <div className="text-[11px] font-bold uppercase tracking-wider text-accent">{place.label}</div>
                <h3 className="text-[17px] font-bold text-ink">{place.name || 'Unnamed place'}</h3>
                {place.address ? <p className="mt-1 text-[13px] text-muted">{place.address}</p> : null}
                {place.phone ? <p className="mt-1 text-[13px] font-bold text-primary">{place.phone}</p> : null}
                {place.notes ? <p className="mt-2 whitespace-pre-wrap text-[13px] text-muted">{place.notes}</p> : null}
              </div>
            ))}
          </div>
        ) : null}

        <DocRows attachments={draft.trip.attachments} label="Travel documents" />

        {contacts.length > 0 ? (
          <>
            <h3 className="mb-2 mt-2 text-[11px] font-bold uppercase tracking-[1.1px] text-accent">Contacts</h3>
            <div className="mb-4 overflow-hidden rounded-lg border border-lineSoft bg-white shadow-sm">
              {contacts.map((c, i) => (
                <div
                  key={c.id}
                  className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t border-lineSoft' : ''}`}
                >
                  <span className="flex-1 text-[15px] text-ink">{c.label}</span>
                  <span className={`text-[13px] ${c.type === 'text' ? 'text-muted' : 'font-bold text-primary'}`}>
                    {c.value}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : null}

        {draft.stays.map((stay) => (
          <div key={stay.id} className="mb-4 overflow-hidden rounded-lg border border-lineSoft bg-white p-4 shadow-sm">
            <h3 className="text-[17px] font-bold text-ink">{stay.name || 'Stay'}</h3>
            <p className="mt-1 text-[13px] text-muted">
              {[stay.city, stay.address].filter(Boolean).join(' · ')}
            </p>
            <DocRows attachments={stay.attachments} label="Booking documents" />
          </div>
        ))}

        {sections.map((section) => (
          <div key={section.id} className="mb-4 overflow-hidden rounded-lg border border-lineSoft bg-white shadow-sm">
            {section.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={section.image} alt={section.title} className="h-[150px] w-full object-cover" />
            ) : null}
            <div className="p-4">
              <h3 className="text-[20px] font-bold leading-tight tracking-tight text-ink">
                {section.title || 'Untitled section'}
              </h3>
              <p className="mt-2 whitespace-pre-wrap text-[15px] leading-[22px] text-muted">{section.body}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
