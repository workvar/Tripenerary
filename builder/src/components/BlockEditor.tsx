'use client';

import { useState } from 'react';
import { Area, Grid3, Select, Text } from '@/components/Field';
import ImageFields from '@/components/ImageFields';
import LocationFields from '@/components/LocationFields';
import { IconButton } from '@/components/ui/Button';
import AiFillButton from '@/components/ai/AiFillButton';
import { ITEM_TYPES, ITEM_TYPE_META } from '@/types/itinerary';
import type { DraftBlock, ItemType } from '@/types/itinerary';

const TYPE_OPTIONS = ITEM_TYPES.map((t) => ({
  value: t,
  label: `${ITEM_TYPE_META[t].glyph}  ${ITEM_TYPE_META[t].label}`,
}));

/** Surrounding facts the AI can lean on, supplied by the day being edited. */
export interface BlockContext {
  readonly trip: string;
  readonly base: string;
  readonly date: string;
}

interface Props {
  readonly block: DraftBlock;
  readonly index: number;
  readonly total: number;
  readonly context: BlockContext;
  readonly onPatch: (patch: Partial<DraftBlock>) => void;
  readonly onRemove: () => void;
  readonly onMove: (delta: number) => void;
}

export default function BlockEditor({
  block,
  index,
  total,
  context,
  onPatch,
  onRemove,
  onMove,
}: Props) {
  const [open, setOpen] = useState(!block.title);
  const meta = ITEM_TYPE_META[block.type];

  return (
    <div className="rounded-md border border-line bg-white">
      <div className="flex items-center gap-2 px-3 py-2">
        <span className="text-base" aria-hidden>
          {meta.glyph}
        </span>
        <button
          type="button"
          aria-expanded={open}
          className="flex-1 rounded-xs text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
          onClick={() => setOpen(!open)}
        >
          <span className="block truncate text-sm font-semibold text-ink">
            {block.title || `Untitled ${meta.label.toLowerCase()}`}
          </span>
          <span className="text-xs text-faint">
            {[block.time, block.endTime].filter(Boolean).join(' – ') || 'No time'}
            {block.location.lat && block.location.lng ? '  ·  pinned' : ''}
          </span>
        </button>

        <IconButton label="Move up" disabled={index === 0} onClick={() => onMove(-1)}>
          {'\u{2191}'}
        </IconButton>
        <IconButton label="Move down" disabled={index === total - 1} onClick={() => onMove(1)}>
          {'\u{2193}'}
        </IconButton>
        <IconButton label="Delete block" variant="danger" onClick={onRemove}>
          {'\u{2715}'}
        </IconButton>
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
            action={
              <AiFillButton
                kind="block"
                value={block.description}
                onFilled={(description) => onPatch({ description })}
                facts={{
                  Trip: context.trip,
                  Date: context.date,
                  City: context.base,
                  Activity: block.title,
                  Kind: meta.label,
                  Starts: block.time,
                  Ends: block.endTime,
                  Place: block.location.name,
                  Address: block.location.address,
                  Cost: block.cost,
                }}
              />
            }
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
