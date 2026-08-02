'use client';

import { Area, Grid2, Grid3, Text } from '@/components/Field';
import LocationFields from '@/components/LocationFields';
import Button, { IconButton } from '@/components/ui/Button';
import AiFillButton from '@/components/ai/AiFillButton';
import { newStay } from '@/lib/factories';
import type { DraftApi } from '@/lib/useDraft';
import type { DraftStay } from '@/types/itinerary';

export default function StaysEditor({ api }: { readonly api: DraftApi }) {
  const { draft, setDraft } = api;

  const patch = (id: string, p: Partial<DraftStay>) =>
    setDraft((d) => ({ ...d, stays: d.stays.map((s) => (s.id === id ? { ...s, ...p } : s)) }));

  const remove = (id: string) =>
    setDraft((d) => ({ ...d, stays: d.stays.filter((s) => s.id !== id) }));

  const usedBy = (key: string) => draft.days.filter((day) => day.stayId === key.trim()).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight text-ink">Stays</h2>
          <p className="text-sm text-muted">Hotels and resorts. Days link to one by its id.</p>
        </div>
        <Button
          size="sm"
          variant="primary"
          onClick={() => setDraft((d) => ({ ...d, stays: [...d.stays, newStay()] }))}
        >
          + Add stay
        </Button>
      </div>

      {draft.stays.length === 0 ? (
        <p className="rounded-md border border-dashed border-line bg-elevated p-6 text-center text-sm text-faint">
          No stays yet.
        </p>
      ) : null}

      {draft.stays.map((stay) => (
        <div key={stay.id} className="card space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="flex-1 truncate text-sm font-bold text-ink">{stay.name || 'Untitled stay'}</h3>
            <span className="rounded-full bg-sunken px-2 py-0.5 text-[11px] font-semibold text-muted">
              used by {usedBy(stay.key)} {usedBy(stay.key) === 1 ? 'day' : 'days'}
            </span>
            <IconButton label="Remove stay" variant="danger" onClick={() => remove(stay.id)}>
              {'\u{2715}'}
            </IconButton>
          </div>

          <Grid2>
            <Text label="Id (referenced by days)" value={stay.key} onChange={(v) => patch(stay.id, { key: v })} placeholder="bkk" />
            <Text label="Name" value={stay.name} onChange={(v) => patch(stay.id, { name: v })} placeholder="Riverside hotel" />
          </Grid2>

          <Grid3>
            <Text label="City" value={stay.city} onChange={(v) => patch(stay.id, { city: v })} />
            <Text label="Check in" value={stay.checkIn} onChange={(v) => patch(stay.id, { checkIn: v })} placeholder="2026-08-22" />
            <Text label="Check out" value={stay.checkOut} onChange={(v) => patch(stay.id, { checkOut: v })} placeholder="2026-08-26" />
          </Grid3>

          <Text label="Address" value={stay.address} onChange={(v) => patch(stay.id, { address: v })} />

          <Grid3>
            <Text label="Phone" value={stay.phone} onChange={(v) => patch(stay.id, { phone: v })} />
            <Text label="Confirmation" value={stay.confirmation} onChange={(v) => patch(stay.id, { confirmation: v })} />
            <Text label="Image URL" value={stay.image} onChange={(v) => patch(stay.id, { image: v })} />
          </Grid3>

          <Area
            label="Notes"
            value={stay.notes}
            onChange={(v) => patch(stay.id, { notes: v })}
            rows={2}
            action={
              <AiFillButton
                kind="stay"
                value={stay.notes}
                onFilled={(notes) => patch(stay.id, { notes })}
                facts={{
                  Trip: draft.trip.title,
                  Hotel: stay.name,
                  City: stay.city,
                  Address: stay.address,
                  'Check in': stay.checkIn,
                  'Check out': stay.checkOut,
                }}
              />
            }
          />
          <LocationFields value={stay.location} onChange={(location) => patch(stay.id, { location })} />
        </div>
      ))}
    </div>
  );
}
