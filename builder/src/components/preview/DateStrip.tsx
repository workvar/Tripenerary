'use client';

import { useState, type CSSProperties } from 'react';
import DayPickerPopup from './DayPickerPopup';
import { formatDayLabel } from '@/lib/dates';
import type { DraftDay } from '@/types/itinerary';

interface Props {
  readonly days: DraftDay[];
  readonly selectedId: string;
  readonly onSelect: (index: number) => void;
}

/** Mirrors src/components/DateStrip.tsx: a compact day slider instead of a tall strip. */
export default function DateStrip({ days, selectedId, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const found = days.findIndex((d) => d.id === selectedId);
  const index = found < 0 ? 0 : found;
  const last = days.length - 1;
  const day = days[index];
  if (!day) return null;

  const step = (delta: number) => {
    const next = Math.max(0, Math.min(last, index + delta));
    if (next !== index) onSelect(next);
  };

  return (
    <div className="relative shrink-0 rounded-t-lg bg-primary px-4 pb-3 pt-2 shadow-[0_-12px_30px_rgba(27,29,28,0.14)]">
      {open ? (
        <DayPickerPopup days={days} index={index} onPick={onSelect} onClose={() => setOpen(false)} />
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="mb-2 flex w-full items-center"
      >
        <span className="text-[13.5px] font-extrabold tracking-tight text-white">Day {index + 1}</span>
        <span className="ml-2 text-[12.5px] font-semibold text-white/70">{formatDayLabel(day.date)}</span>
        <span className="ml-1 text-[20px] leading-none text-white/70">▾</span>
        <span className="flex-1" />
        <span className="text-[11px] font-bold text-white/35">
          {index + 1} / {days.length}
        </span>
      </button>

      <div className="flex items-center">
        <StepButton label="‹" onClick={() => step(-1)} disabled={index === 0} />
        <input
          type="range"
          min={0}
          max={Math.max(0, last)}
          value={index}
          aria-label="Select day"
          onChange={(e) => onSelect(Number(e.target.value))}
          style={{ '--pct': `${last > 0 ? (index / last) * 100 : 0}%` } as CSSProperties}
          className="day-range h-7 flex-1"
        />
        <StepButton label="›" onClick={() => step(1)} disabled={index === last} />
      </div>
    </div>
  );
}

function StepButton({
  label,
  onClick,
  disabled,
}: {
  readonly label: string;
  readonly onClick: () => void;
  readonly disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-[26px] text-[20px] font-bold leading-6 text-white/70 transition disabled:text-white/20"
    >
      {label}
    </button>
  );
}
