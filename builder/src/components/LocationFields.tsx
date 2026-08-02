'use client';

import { useState } from 'react';
import { Grid2, Text } from '@/components/Field';
import Button from '@/components/ui/Button';
import type { DraftLocation } from '@/types/itinerary';

interface Props {
  readonly value: DraftLocation;
  readonly onChange: (next: DraftLocation) => void;
}

/** Accepts a pasted Google Maps URL and lifts the coordinates out of it. */
function coordsFromUrl(url: string): { lat: string; lng: string } | null {
  const at = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (at?.[1] && at[2]) return { lat: at[1], lng: at[2] };

  const query = url.match(/[?&](?:q|query|destination)=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (query?.[1] && query[2]) return { lat: query[1], lng: query[2] };

  const bang = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (bang?.[1] && bang[2]) return { lat: bang[1], lng: bang[2] };

  return null;
}

export default function LocationFields({ value, onChange }: Props) {
  const [open, setOpen] = useState(
    Boolean(value.placeId || value.googleMapsUrl || value.address)
  );

  const set = (patch: Partial<DraftLocation>) => onChange({ ...value, ...patch });

  const paste = (url: string) => {
    const found = coordsFromUrl(url);
    set(found ? { googleMapsUrl: url, ...found } : { googleMapsUrl: url });
  };

  const pinned = Boolean(value.lat && value.lng);

  return (
    <div className="rounded-sm border border-lineSoft bg-elevated p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
          Location {pinned ? <span className="text-primary">{'\u{2713}'} pinned</span> : null}
        </span>
        <Button size="xs" variant="subtle" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? 'Fewer fields' : 'More fields'}
        </Button>
      </div>

      <Grid2>
        <Text label="Place name" value={value.name} onChange={(v) => set({ name: v })} placeholder="Wat Arun" />
        <div className="grid grid-cols-2 gap-3">
          <Text label="Lat" value={value.lat} onChange={(v) => set({ lat: v })} placeholder="13.7437" />
          <Text label="Lng" value={value.lng} onChange={(v) => set({ lng: v })} placeholder="100.4889" />
        </div>
      </Grid2>

      {open ? (
        <div className="mt-3 space-y-3">
          <Text label="Address" value={value.address} onChange={(v) => set({ address: v })} />
          <Grid2>
            <Text
              label="Google Maps URL"
              value={value.googleMapsUrl}
              onChange={paste}
              placeholder="Paste a maps link to fill lat/lng"
            />
            <Text label="Place ID" value={value.placeId} onChange={(v) => set({ placeId: v })} />
          </Grid2>
        </div>
      ) : null}

      <p className="mt-2 text-[11px] text-faint">
        Coordinates drive the map preview and the day route line. Without them the block still works,
        it just will not appear on the map.
      </p>
    </div>
  );
}
