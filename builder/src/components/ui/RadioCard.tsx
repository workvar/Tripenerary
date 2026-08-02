'use client';

import { cx, FOCUS_RING } from '@/components/ui/tokens';

interface Props {
  readonly checked: boolean;
  readonly onSelect: () => void;
  readonly label: string;
  readonly hint?: string;
}

/** Replaces the native radio input so the dot matches the palette. */
export default function RadioCard({ checked, onSelect, label, hint }: Props) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onSelect}
      className={cx(
        'flex w-full items-start gap-3 rounded-sm border p-3 text-left transition',
        FOCUS_RING,
        checked ? 'border-primary bg-primarySoft' : 'border-line bg-white hover:border-primary/40'
      )}
    >
      <span
        aria-hidden
        className={cx(
          'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition',
          checked ? 'border-primary' : 'border-line'
        )}
      >
        <span className={cx('h-2 w-2 rounded-full transition', checked ? 'bg-primary' : 'bg-transparent')} />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-bold text-ink">{label}</span>
        {hint ? <span className="block text-[12px] text-muted">{hint}</span> : null}
      </span>
    </button>
  );
}
