'use client';

import { useEffect, useRef } from 'react';
import { formatDayLabel } from '@/lib/dates';
import type { DraftDay } from '@/types/itinerary';

interface Props {
  readonly days: DraftDay[];
  readonly index: number;
  readonly onPick: (index: number) => void;
  readonly onClose: () => void;
}

/** Mirrors src/components/DayPickerSheet.tsx: the full day list, opened from the slider header. */
export default function DayPickerPopup({ days, index, onPick, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.querySelector<HTMLElement>('[data-selected="true"]')?.scrollIntoView({
      block: 'center',
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onClose}
        className="fixed inset-0 z-10 cursor-default"
      />
      <div
        ref={ref}
        role="listbox"
        aria-label="Jump to a day"
        className="phone-scroll absolute bottom-full left-3 right-3 z-20 mb-2 max-h-[260px] overflow-y-auto rounded-lg border border-lineSoft bg-white p-1 shadow-lg"
      >
        {days.map((d, i) => {
          const selected = i === index;
          return (
            <button
              key={d.id}
              type="button"
              role="option"
              aria-selected={selected}
              data-selected={selected}
              onClick={() => {
                onPick(i);
                onClose();
              }}
              className={`flex w-full items-center rounded-md px-3 py-2 text-left transition ${
                selected ? 'bg-primarySoft' : 'hover:bg-sunken'
              }`}
            >
              <span className={`w-14 text-[14px] font-bold ${selected ? 'text-primary' : 'text-ink'}`}>
                Day {i + 1}
              </span>
              <span className={`text-[13px] ${selected ? 'text-primary' : 'text-muted'}`}>
                {formatDayLabel(d.date)}
              </span>
              <span className="flex-1" />
              {selected ? <span className="text-[13px] font-bold text-primary">✓</span> : null}
            </button>
          );
        })}
      </div>
    </>
  );
}
