'use client';

import { Area, Grid2, Select, Text } from '@/components/Field';
import LocationFields from '@/components/LocationFields';
import Button, { IconButton } from '@/components/ui/Button';
import { newContact, newEmergencyLocation, newInfo } from '@/lib/factories';
import type { DraftApi } from '@/lib/useDraft';
import { CONTACT_TYPES } from '@/types/itinerary';
import type { ContactType, DraftContact, DraftEmergencyLocation, DraftInfo } from '@/types/itinerary';

const CONTACT_OPTIONS = CONTACT_TYPES.map((t) => ({ value: t, label: t }));

export default function InfoEditor({ api }: { readonly api: DraftApi }) {
  const { draft, setDraft } = api;

  const patchInfo = (id: string, p: Partial<DraftInfo>) =>
    setDraft((d) => ({ ...d, info: d.info.map((i) => (i.id === id ? { ...i, ...p } : i)) }));

  const patchContact = (id: string, p: Partial<DraftContact>) =>
    setDraft((d) => ({ ...d, contacts: d.contacts.map((c) => (c.id === id ? { ...c, ...p } : c)) }));

  const patchEmergencyContact = (id: string, p: Partial<DraftContact>) =>
    setDraft((d) => ({
      ...d,
      emergency: {
        ...d.emergency,
        contacts: d.emergency.contacts.map((c) => (c.id === id ? { ...c, ...p } : c)),
      },
    }));

  const patchEmergencyLocation = (id: string, p: Partial<DraftEmergencyLocation>) =>
    setDraft((d) => ({
      ...d,
      emergency: {
        ...d.emergency,
        locations: d.emergency.locations.map((l) => (l.id === id ? { ...l, ...p } : l)),
      },
    }));

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-ink">Emergency</h2>
            <p className="text-sm text-muted">
              Embassy locations and emergency numbers shown first on the trip info screen.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-ink">Emergency contacts</h3>
          <Button
            size="sm"
            variant="primary"
            onClick={() =>
              setDraft((d) => ({
                ...d,
                emergency: {
                  ...d.emergency,
                  contacts: [...d.emergency.contacts, { ...newContact(), type: 'phone' }],
                },
              }))
            }
          >
            + Add contact
          </Button>
        </div>

        {draft.emergency.contacts.length === 0 ? (
          <p className="rounded-md border border-dashed border-line bg-elevated p-4 text-center text-sm text-faint">
            Police, ambulance, tourist hotline — anything to dial in a hurry.
          </p>
        ) : null}

        {draft.emergency.contacts.map((contact) => (
          <div key={contact.id} className="card">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Grid2>
                  <Text
                    label="Label"
                    value={contact.label}
                    onChange={(v) => patchEmergencyContact(contact.id, { label: v })}
                    placeholder="Tourist police"
                  />
                  <Text
                    label="Value"
                    value={contact.value}
                    onChange={(v) => patchEmergencyContact(contact.id, { value: v })}
                    placeholder="1155"
                  />
                </Grid2>
              </div>
              <Select<ContactType>
                label="Type"
                value={contact.type}
                onChange={(v) => patchEmergencyContact(contact.id, { type: v })}
                options={CONTACT_OPTIONS}
                className="w-32 shrink-0"
              />
              <IconButton
                label="Remove contact"
                variant="danger"
                size="md"
                onClick={() =>
                  setDraft((d) => ({
                    ...d,
                    emergency: {
                      ...d.emergency,
                      contacts: d.emergency.contacts.filter((c) => c.id !== contact.id),
                    },
                  }))
                }
              >
                {'\u{2715}'}
              </IconButton>
            </div>
          </div>
        ))}

        <div className="flex items-center justify-between pt-2">
          <h3 className="text-sm font-bold text-ink">Embassy &amp; emergency places</h3>
          <Button
            size="sm"
            variant="primary"
            onClick={() =>
              setDraft((d) => ({
                ...d,
                emergency: {
                  ...d.emergency,
                  locations: [...d.emergency.locations, newEmergencyLocation()],
                },
              }))
            }
          >
            + Add place
          </Button>
        </div>

        {draft.emergency.locations.length === 0 ? (
          <p className="rounded-md border border-dashed border-line bg-elevated p-4 text-center text-sm text-faint">
            Your embassy, nearest hospital, or other place worth pinning on a map.
          </p>
        ) : null}

        {draft.emergency.locations.map((place) => (
          <div key={place.id} className="card space-y-3">
            <div className="flex items-end gap-2">
              <Text
                label="Label"
                value={place.label}
                onChange={(v) => patchEmergencyLocation(place.id, { label: v })}
                placeholder="Embassy"
                className="w-40 shrink-0"
              />
              <Text
                label="Name"
                value={place.name}
                onChange={(v) => patchEmergencyLocation(place.id, { name: v })}
                placeholder="Embassy of India, Bangkok"
                className="flex-1"
              />
              <IconButton
                label="Remove place"
                variant="danger"
                size="md"
                onClick={() =>
                  setDraft((d) => ({
                    ...d,
                    emergency: {
                      ...d.emergency,
                      locations: d.emergency.locations.filter((l) => l.id !== place.id),
                    },
                  }))
                }
              >
                {'\u{2715}'}
              </IconButton>
            </div>
            <Grid2>
              <Text
                label="Address"
                value={place.address}
                onChange={(v) => patchEmergencyLocation(place.id, { address: v })}
                placeholder="Street, city"
              />
              <Text
                label="Phone"
                value={place.phone}
                onChange={(v) => patchEmergencyLocation(place.id, { phone: v })}
                placeholder="+66 …"
              />
            </Grid2>
            <Area
              label="Notes"
              value={place.notes}
              onChange={(v) => patchEmergencyLocation(place.id, { notes: v })}
              rows={2}
              placeholder="Hours, what to bring, nearest gate…"
            />
            <LocationFields
              value={place.location}
              onChange={(location) => patchEmergencyLocation(place.id, { location })}
            />
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-ink">Practical information</h2>
            <p className="text-sm text-muted">Long-form sections on the trip info screen.</p>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setDraft((d) => ({ ...d, info: [...d.info, newInfo()] }))}
          >
            + Add section
          </Button>
        </div>

        {draft.info.length === 0 ? (
          <p className="rounded-md border border-dashed border-line bg-elevated p-6 text-center text-sm text-faint">
            Nothing written yet. Good places to start: visas, money, packing, health, local etiquette.
          </p>
        ) : null}

        {draft.info.map((section) => (
          <div key={section.id} className="card space-y-3">
            <div className="flex items-end gap-2">
              <Text
                label="Title"
                value={section.title}
                onChange={(v) => patchInfo(section.id, { title: v })}
                className="flex-1"
              />
              <IconButton
                label="Remove section"
                variant="danger"
                size="md"
                onClick={() =>
                  setDraft((d) => ({ ...d, info: d.info.filter((i) => i.id !== section.id) }))
                }
              >
                {'\u{2715}'}
              </IconButton>
            </div>
            <Area
              label="Body"
              value={section.body}
              onChange={(v) => patchInfo(section.id, { body: v })}
              rows={6}
            />
            <Text
              label="Image URL"
              value={section.image}
              onChange={(v) => patchInfo(section.id, { image: v })}
            />
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-ink">Useful contacts</h2>
            <p className="text-sm text-muted">Non-emergency numbers and links worth having offline.</p>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setDraft((d) => ({ ...d, contacts: [...d.contacts, newContact()] }))}
          >
            + Add contact
          </Button>
        </div>

        {draft.contacts.map((contact) => (
          <div key={contact.id} className="card">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Grid2>
                  <Text
                    label="Label"
                    value={contact.label}
                    onChange={(v) => patchContact(contact.id, { label: v })}
                    placeholder="Hotel concierge"
                  />
                  <Text
                    label="Value"
                    value={contact.value}
                    onChange={(v) => patchContact(contact.id, { value: v })}
                    placeholder="+66 …"
                  />
                </Grid2>
              </div>
              <Select<ContactType>
                label="Type"
                value={contact.type}
                onChange={(v) => patchContact(contact.id, { type: v })}
                options={CONTACT_OPTIONS}
                className="w-32 shrink-0"
              />
              <IconButton
                label="Remove contact"
                variant="danger"
                size="md"
                onClick={() =>
                  setDraft((d) => ({
                    ...d,
                    contacts: d.contacts.filter((c) => c.id !== contact.id),
                  }))
                }
              >
                {'\u{2715}'}
              </IconButton>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
