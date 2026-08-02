'use client';

import { Area, Grid2, Select, Text } from '@/components/Field';
import BlockEditor from '@/components/BlockEditor';
import NotesEditor from '@/components/NotesEditor';
import { dayProgress } from '@/lib/stats';
import type { DraftApi } from '@/lib/useDraft';
import type { DraftDay, DraftStay } from '@/types/itinerary';

interface Props {
  readonly day: DraftDay;
  readonly index: number;
  readonly total: number;
  readonly stays: DraftStay[];
  readonly api: DraftApi;
}

export default function DayEditor({ day, index, total, stays, api }: Props) {
  const { blocks, done } = dayProgress(day);

  const stayOptions = [
    { value: '', label: 'No stay' },
    ...stays
      .filter((s) => s.key.trim())
      .map((s) => ({ value: s.key.trim(), label: `${s.key} — ${s.name || 'unnamed'}` })),
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-extrabold tracking-tight text-ink">Day {index + 1}</h2>
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
            done ? 'bg-primarySoft text-primary' : 'bg-sunken text-muted'
          }`}
        >
          {done ? 'Planned' : 'In progress'} · {blocks} {blocks === 1 ? 'block' : 'blocks'}
        </span>

        <div className="ml-auto flex gap-2">
          <button type="button" className="btn-mini" disabled={index === 0} onClick={() => api.moveDay(day.id, -1)} title="Move day earlier">
            {'\u{2191}'}
          </button>
          <button
            type="button"
            className="btn-mini"
            disabled={index === total - 1}
            onClick={() => api.moveDay(day.id, 1)}
            title="Move day later"
          >
            {'\u{2193}'}
          </button>
          <button type="button" className="btn-ghost !py-1 !text-xs" onClick={() => api.duplicateDay(day.id)}>
            Duplicate
          </button>
          <button
            type="button"
            className="btn-danger !py-1 !text-xs"
            disabled={total <= 1}
            onClick={() => api.removeDay(day.id)}
          >
            Delete day
          </button>
        </div>
      </div>

      <div className="card space-y-3">
        <Grid2>
          <Text label="Date" value={day.date} onChange={(v) => api.patchDay(day.id, { date: v })} placeholder="2026-08-22" />
          <Text label="Base (city shown on the strip)" value={day.base} onChange={(v) => api.patchDay(day.id, { base: v })} placeholder="Bangkok" />
        </Grid2>

        <Text label="Day title" value={day.title} onChange={(v) => api.patchDay(day.id, { title: v })} placeholder="Arrival and a gentle introduction" />
        <Area label="Summary" value={day.summary} onChange={(v) => api.patchDay(day.id, { summary: v })} rows={2} />

        <Grid2>
          <Select
            label="Stay"
            value={day.stayId}
            onChange={(v) => api.patchDay(day.id, { stayId: v })}
            options={stayOptions}
          />
          <Text label="Hero image URL" value={day.image} onChange={(v) => api.patchDay(day.id, { image: v })} placeholder="https://..." />
        </Grid2>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted">Schedule blocks</h3>
          <button type="button" className="btn-primary !py-1.5 !text-xs" onClick={() => api.addBlock(day.id)}>
            + Add block
          </button>
        </div>

        {day.items.length === 0 ? (
          <p className="rounded-md border border-dashed border-line bg-elevated p-6 text-center text-sm text-faint">
            No blocks yet. Add the first thing that happens on this day.
          </p>
        ) : null}

        {day.items.map((block, i) => (
          <BlockEditor
            key={block.id}
            block={block}
            index={i}
            total={day.items.length}
            onPatch={(patch) => api.patchBlock(day.id, block.id, patch)}
            onRemove={() => api.removeBlock(day.id, block.id)}
            onMove={(delta) => api.moveBlock(day.id, block.id, delta)}
          />
        ))}
      </div>

      <NotesEditor notes={day.notes} onChange={(notes) => api.patchDay(day.id, { notes })} />
    </div>
  );
}
