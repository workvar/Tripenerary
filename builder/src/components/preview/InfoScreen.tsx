'use client';

import type { Draft } from '@/types/itinerary';

/** The trip info screen: long-form sections plus the contact list. */
export default function InfoScreen({ draft }: { readonly draft: Draft }) {
  const sections = draft.info.filter((i) => i.title.trim() || i.body.trim());
  const contacts = draft.contacts.filter((c) => c.label.trim() || c.value.trim());

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
        {sections.length === 0 && contacts.length === 0 ? (
          <p className="py-20 text-center text-sm text-faint">
            Nothing written yet. Add documents in the Info tab.
          </p>
        ) : null}

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

        {contacts.length > 0 ? (
          <>
            <h3 className="mb-2 mt-6 text-[11px] font-bold uppercase tracking-[1.1px] text-accent">Contacts</h3>
            <div className="overflow-hidden rounded-lg border border-lineSoft bg-white shadow-sm">
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
      </div>
    </>
  );
}
