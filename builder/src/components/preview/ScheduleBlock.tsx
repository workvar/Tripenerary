'use client';

import BlockImages from './BlockImages';
import { DOC_GLYPH, DOC_LABEL, fileLabel } from '@/lib/attachmentMeta';
import { ITEM_TYPE_META } from '@/types/itinerary';
import type { DraftBlock } from '@/types/itinerary';

/** Mirrors src/components/ScheduleItem.tsx: time row on top, card beneath. */
export default function ScheduleBlock({ block }: { readonly block: DraftBlock }) {
  const meta = ITEM_TYPE_META[block.type];
  const hasBooking = Boolean(block.bookingRef || block.bookingUrl);
  const photos = block.images.filter((i) => i.url.trim());
  const docs = block.attachments.filter((a) => a.url.trim());
  const place = block.location.name || block.location.address;

  return (
    <div className="mb-4">
      <div className="mb-2 flex items-center pl-0.5">
        <span className="mr-2 h-1.5 w-1.5 rounded-full bg-accent" />
        <span className="text-[13.5px] font-extrabold tracking-wide text-primary">
          {block.time || 'Any time'}
        </span>
        {block.endTime ? <span className="ml-1.5 text-[13px] font-semibold text-faint">– {block.endTime}</span> : null}
        <span className="flex-1" />
        <span className="flex items-center gap-1.5 rounded-full bg-sunken px-2.5 py-0.5">
          <span className="text-[11px]">{meta.glyph}</span>
          <span className="text-[11px] font-bold text-muted">{meta.label}</span>
        </span>
      </div>

      <div className="rounded-lg border border-lineSoft bg-white p-4 shadow-sm">
        <h3 className="text-[20px] font-bold leading-tight tracking-tight text-ink">
          {block.title || 'Untitled block'}
        </h3>
        {block.description ? (
          <p className="mt-2 whitespace-pre-wrap text-[15px] leading-[22px] text-muted">{block.description}</p>
        ) : null}

        <BlockImages images={photos} alt={block.title} />

        {docs.length > 0 ? (
          <div className="mt-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-faint">Documents</span>
            <div className="mt-2 space-y-2">
              {docs.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center gap-3 rounded-sm border border-line bg-elevated px-3 py-2"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-xs bg-primarySoft text-sm">
                    {DOC_GLYPH[d.kind]}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-bold text-ink">
                      {d.title || fileLabel(d.url)}
                    </span>
                    <span className="block truncate text-[11.5px] text-faint">
                      {d.note || DOC_LABEL[d.kind]}
                    </span>
                  </span>
                  <span className="text-[15px] text-faint">{'\u{203A}'}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {block.cost || hasBooking ? (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {block.cost ? (
              <span className="rounded-xs bg-accentSoft px-2.5 py-1 text-[12.5px] font-extrabold text-accent">
                {block.cost}
              </span>
            ) : null}
            {hasBooking ? (
              <span className={`text-[13px] font-bold text-primary ${block.bookingUrl ? 'underline' : ''}`}>
                Booking{block.bookingRef ? ` · ${block.bookingRef}` : ''}
              </span>
            ) : null}
          </div>
        ) : null}

        {place ? (
          <div className="mt-3 flex items-center gap-2 rounded-sm bg-elevated px-3 py-2">
            <span className="text-sm">{'\u{1F4CD}'}</span>
            <span className="flex-1 truncate text-[13px] text-muted">{place}</span>
            <span className="text-[13px] text-primary">{'\u{203A}'}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
