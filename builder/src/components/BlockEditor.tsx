'use client';

import { useState } from 'react';
import { Area, Grid3, Select, Text } from '@/components/Field';
import ImageFields from '@/components/ImageFields';
import LocationFields from '@/components/LocationFields';
import { ITEM_TYPES, ITEM_TYPE_META } from '@/types/itinerary';
import type { DraftBlock, ItemType } from '@/types/itinerary';

const TYPE_OPTIONS = ITEM_TYPES.map((t) => ({
  value: t,
  label: `${ITEM_TYPE_META[t].glyph}  ${ITEM_TYPE_META[t].label}`,
}));

interface Props {
  readonly block: DraftBlock;
  readonly index: number;
  readonly total: number;
  readonly onPatch: (patch: Partial<DraftBlock>) => void;
  readonly onRemove: () => void;
  readonly onMove: (delta: number) => void;
}

export default function BlockEditor({ block, index, total, onPatch, onRemove, onMove }: Props) {
  const [open, setOpen] = useState(!block.title);
  const meta = ITEM_TYPE_META[block.type];

  return (
    <div className="rounded-md border border-line bg-white">
      <div className="flex items-center gap-2 px-3 py-2">
        <span className="text-base" aria-hidden>
          {meta.glyph}
        </span>
        <button type="button" className="flex-1 text-left" onClick={() => setOpen(!open)}>
          <span className="block truncate text-sm font-semibold text-ink">
            {block.title || `Untitled ${meta.label.toLowerCase()}`}
          </span>
          <span className="text-xs text-faint">
            {[block.time, block.endTime].filter(Boolean).join(' – ') || 'No time'}
            {block.location.lat && block.location.lng ? '  ·  pinned' : ''}
          </span>
        </button>

        <button type="button" className="btn-mini" disabled={index === 0} onClick={() => onMove(-1)} title="Move up">
          {'\u{2191}'}
        </button>
        <button
          type="button"
          className="btn-mini"
          disabled={index === total - 1}
          onClick={() => onMove(1)}
          title="Move down"
        >
          {'\u{2193}'}
        </button>
        <button type="button" className="btn-mini hover:border-danger hover:text-danger" onClick={onRemove} title="Delete block">
          {'\u{2715}'}
        </button>
      </div>

      {open ? (
        <div className="space-y-3 border-t border-lineSoft p-3">
          <Grid3>
            <Text label="Start" value={block.time} onChange={(v) => onPatch({ time: v })} placeholder="09:30 or Morning" />
            <Text label="End" value={block.endTime} onChange={(v) => onPatch({ endTime: v })} placeholder="11:00" />
            <Select<ItemType>
              label="Type"
              value={block.type}
              onChange={(v) => onPatch({ type: v })}
              options={TYPE_OPTIONS}
            />
          </Grid3>

          <Text label="Title" value={block.title} onChange={(v) => onPatch({ title: v })} placeholder="Sunrise at Wat Arun" />
          <Area
            label="Description"
            value={block.description}
            onChange={(v) => onPatch({ description: v })}
            placeholder="What happens, how long it takes, anything worth knowing."
          />

          <Grid3>
            <Text label="Cost" value={block.cost} onChange={(v) => onPatch({ cost: v })} placeholder="200 THB" />
            <Text label="Booking ref" value={block.bookingRef} onChange={(v) => onPatch({ bookingRef: v })} />
            <Text label="Booking URL" value={block.bookingUrl} onChange={(v) => onPatch({ bookingUrl: v })} />
          </Grid3>

          <LocationFields value={block.location} onChange={(location) => onPatch({ location })} />
          <ImageFields images={block.images} onChange={(images) => onPatch({ images })} />
        </div>
      ) : null}
    </div>
  );
}
