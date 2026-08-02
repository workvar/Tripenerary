'use client';

import { useEffect, useRef } from 'react';
import { dayOfMonth, monthShort, weekdayShort } from '@/lib/dates';
import type { DraftDay } from '@/types/itinerary';

interface Props {
  readonly days: DraftDay[];
  readonly selectedId: string;
  readonly onSelect: (index: number) => void;
}

/** Mirrors src/components/DateStrip.tsx, including the Day N label under the circle. */
export default function DateStrip({ days, selectedId, onSelect }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current?.querySelector<HTMLElement>('[data-selected="true"]');
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [selectedId]);

  return (
    <div className="shrink-0 rounded-t-lg bg-primary shadow-[0_-12px_30px_rgba(27,29,28,0.14)]">
      <div ref={ref} className="phone-scroll flex gap-3 overflow-x-auto px-4 py-3">
        {days.map((day, i) => {
          const selected = day.id === selectedId;
          return (
            <button
              key={day.id}
              type="button"
              data-selected={selected}
              onClick={() => onSelect(i)}
              className="flex w-12 shrink-0 flex-col items-center"
            >
              <span className="mb-[5px] text-[10px] font-bold uppercase tracking-[0.8px] text-white/70">
                {weekdayShort(day.date)}
              </span>

              <span
                className={`flex h-12 w-12 flex-col items-center justify-center rounded-full transition ${
                  selected ? 'bg-white shadow-md' : 'bg-white/10'
                }`}
              >
                <span
                  className={`text-[18px] font-extrabold leading-none tracking-tight ${
                    selected ? 'text-primaryDark' : 'text-white'
                  }`}
                >
                  {dayOfMonth(day.date) || '--'}
                </span>
                <span className={`text-[9px] font-semibold ${selected ? 'text-muted' : 'text-white/70'}`}>
                  {monthShort(day.date)}
                </span>
              </span>

              <span
                className={`mt-[5px] text-[9.5px] font-bold tracking-wide ${
                  selected ? 'text-white' : 'text-white/35'
                }`}
              >
                Day {i + 1}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
