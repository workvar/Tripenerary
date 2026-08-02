'use client';

import { Grid2, Text } from '@/components/Field';
import { newImage } from '@/lib/factories';
import type { DraftImage } from '@/types/itinerary';

interface Props {
  readonly images: DraftImage[];
  readonly onChange: (next: DraftImage[]) => void;
}

export default function ImageFields({ images, onChange }: Props) {
  const set = (id: string, patch: Partial<DraftImage>) =>
    onChange(images.map((img) => (img.id === id ? { ...img, ...patch } : img)));

  return (
    <div className="rounded-sm border border-lineSoft bg-elevated p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
          Photos {images.length > 0 ? `(${images.length})` : null}
        </span>
        <button
          type="button"
          className="text-xs font-semibold text-primary"
          onClick={() => onChange([...images, newImage()])}
        >
          + Add photo
        </button>
      </div>

      {images.length === 0 ? (
        <p className="text-xs text-faint">No photos. The block renders as text only.</p>
      ) : null}

      <div className="space-y-3">
        {images.map((img) => (
          <div key={img.id} className="space-y-2">
            <div className="flex gap-2">
              <input
                className="field"
                value={img.url}
                placeholder="https://..."
                onChange={(e) => set(img.id, { url: e.target.value })}
              />
              <button
                type="button"
                className="btn-mini"
                title="Remove photo"
                onClick={() => onChange(images.filter((i) => i.id !== img.id))}
              >
                {'\u{2715}'}
              </button>
            </div>
            <Grid2>
              <Text label="Caption" value={img.caption} onChange={(v) => set(img.id, { caption: v })} />
              <Text label="Credit" value={img.credit} onChange={(v) => set(img.id, { credit: v })} />
            </Grid2>
          </div>
        ))}
      </div>
    </div>
  );
}
