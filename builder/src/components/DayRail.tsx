'use client';

import { dayProgress } from '@/lib/stats';
import { dayOfMonth, monthShort, weekdayShort } from '@/lib/dates';
import type { DraftApi } from '@/lib/useDraft';

/** Vertical day picker for the editor side. Distinct from the phone date strip. */
export default function DayRail({ api }: { readonly api: DraftApi }) {
  const { draft, dayIndex, setDayIndex, addDay } = api;

  return (
    <div className="flex shrink-0 flex-col gap-2">
      <div className="phone-scroll flex gap-2 overflow-x-auto pb-1">
        {draft.days.map((day, i) => {
          const { blocks, done } = dayProgress(day);
          const active = i === dayIndex;

          return (
            <button
              key={day.id}
              type="button"
              onClick={() => setDayIndex(i)}
              className={`w-[86px] shrink-0 rounded-md border p-2 text-left transition ${
                active
                  ? 'border-primary bg-primary text-white'
                  : 'border-line bg-white hover:border-primary/40'
              }`}
            >
              <div className={`text-[10px] font-bold uppercase tracking-wider ${active ? 'text-white/70' : 'text-faint'}`}>
                Day {i + 1}
              </div>
              <div className={`text-sm font-extrabold tracking-tight ${active ? 'text-white' : 'text-ink'}`}>
                {dayOfMonth(day.date) || '--'} {monthShort(day.date)}
              </div>
              <div className={`text-[10px] ${active ? 'text-white/70' : 'text-muted'}`}>
                {weekdayShort(day.date) || 'no date'}
              </div>
              <div
                className={`mt-1 inline-block rounded-full px-1.5 py-0.5 text-[9.5px] font-bold ${
                  active
                    ? 'bg-white/20 text-white'
                    : done
                      ? 'bg-primarySoft text-primary'
                      : 'bg-sunken text-muted'
                }`}
              >
                {blocks} {blocks === 1 ? 'block' : 'blocks'}
              </div>
            </button>
          );
        })}

        <button
          type="button"
          onClick={addDay}
          className="flex w-[86px] shrink-0 flex-col items-center justify-center rounded-md border border-dashed border-line bg-white text-primary transition hover:border-primary"
        >
          <span className="text-xl leading-none">+</span>
          <span className="mt-1 text-[10px] font-bold uppercase tracking-wider">New day</span>
        </button>
      </div>
    </div>
  );
}
