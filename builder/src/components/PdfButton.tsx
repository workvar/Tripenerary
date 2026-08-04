'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { downloadDayPdf, downloadTripPdf } from '@/lib/pdf/buildPdf';
import type { ButtonVariant, ControlSize } from '@/components/ui/tokens';
import type { Draft } from '@/types/itinerary';

interface Props {
  readonly draft: Draft;
  /** Leave out to put every day in one file, one page each. */
  readonly dayIndex?: number;
  readonly label: string;
  readonly variant?: ButtonVariant;
  readonly size?: ControlSize;
}

/** Downloads a printable, shareable PDF. Photos are fetched at click time, so
 *  this takes a moment on days with a hero image. */
export default function PdfButton({ draft, dayIndex, label, variant = 'ghost', size = 'sm' }: Props) {
  const [state, setState] = useState<'idle' | 'busy' | 'failed'>('idle');

  const run = async () => {
    setState('busy');
    try {
      if (typeof dayIndex === 'number') await downloadDayPdf(draft, dayIndex);
      else await downloadTripPdf(draft);
      setState('idle');
    } catch {
      setState('failed');
      setTimeout(() => setState('idle'), 3000);
    }
  };

  return (
    <Button
      size={size}
      variant={state === 'failed' ? 'danger' : variant}
      disabled={state === 'busy' || draft.days.length === 0}
      onClick={run}
    >
      {state === 'busy' ? 'Building…' : state === 'failed' ? 'PDF failed' : label}
    </Button>
  );
}
