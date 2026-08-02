'use client';

import { Area, Grid2, Select, Text } from '@/components/Field';
import { newContact, newInfo } from '@/lib/factories';
import type { DraftApi } from '@/lib/useDraft';
import { CONTACT_TYPES } from '@/types/itinerary';
import type { ContactType, DraftContact, DraftInfo } from '@/types/itinerary';

const CONTACT_OPTIONS = CONTACT_TYPES.map((t) => ({ value: t, label: t }));

export default function InfoEditor({ api }: { readonly api: DraftApi }) {
  const { draft, setDraft } = api;

  const patchInfo = (id: string, p: Partial<DraftInfo>) =>
    setDraft((d) => ({ ...d, info: d.info.map((i) => (i.id === id ? { ...i, ...p } : i)) }));

  const patchContact = (id: string, p: Partial<DraftContact>) =>
    setDraft((d) => ({ ...d, contacts: d.contacts.map((c) => (c.id === id ? { ...c, ...p } : c)) }));

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-ink">Documents</h2>
            <p className="text-sm text-muted">Long-form sections on the trip info screen.</p>
          </div>
          <button
            type="button"
            className="btn-primary !py-1.5 !text-xs"
            onClick={() => setDraft((d) => ({ ...d, info: [...d.info, newInfo()] }))}
          >
            + Add section
          </button>
        </div>

        {draft.info.length === 0 ? (
          <p className="rounded-md border border-dashed border-line bg-elevated p-6 text-center text-sm text-faint">
            Nothing written yet. Good places to start: visas, money, packing, health, local etiquette.
          </p>
        ) : null}

        {draft.info.map((section) => (
          <div key={section.id} className="card space-y-3">
            <div className="flex items-center gap-2">
              <Text label="Title" value={section.title} onChange={(v) => patchInfo(section.id, { title: v })} className="flex-1" />
              <button
                type="button"
                className="btn-mini mt-5 hover:border-danger hover:text-danger"
                onClick={() => setDraft((d) => ({ ...d, info: d.info.filter((i) => i.id !== section.id) }))}
              >
                {'\u{2715}'}
              </button>
            </div>
            <Area label="Body" value={section.body} onChange={(v) => patchInfo(section.id, { body: v })} rows={6} />
            <Text label="Image URL" value={section.image} onChange={(v) => patchInfo(section.id, { image: v })} />
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-ink">Contacts</h2>
            <p className="text-sm text-muted">Numbers and links worth having offline.</p>
          </div>
          <button
            type="button"
            className="btn-primary !py-1.5 !text-xs"
            onClick={() => setDraft((d) => ({ ...d, contacts: [...d.contacts, newContact()] }))}
          >
            + Add contact
          </button>
        </div>

        {draft.contacts.map((contact) => (
          <div key={contact.id} className="card">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Grid2>
                  <Text label="Label" value={contact.label} onChange={(v) => patchContact(contact.id, { label: v })} placeholder="Tourist police" />
                  <Text label="Value" value={contact.value} onChange={(v) => patchContact(contact.id, { value: v })} placeholder="1155" />
                </Grid2>
              </div>
              <Select<ContactType>
                label="Type"
                value={contact.type}
                onChange={(v) => patchContact(contact.id, { type: v })}
                options={CONTACT_OPTIONS}
                className="w-28"
              />
              <button
                type="button"
                className="btn-mini mb-1 hover:border-danger hover:text-danger"
                onClick={() => setDraft((d) => ({ ...d, contacts: d.contacts.filter((c) => c.id !== contact.id) }))}
              >
                {'\u{2715}'}
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
