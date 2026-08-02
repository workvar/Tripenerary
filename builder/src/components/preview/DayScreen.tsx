'use client';

import DateStrip from '@/components/preview/DateStrip';
import RoutePreview from '@/components/preview/RoutePreview';
import ScheduleBlock from '@/components/preview/ScheduleBlock';
import { longDate } from '@/lib/dates';
import { buildRoute } from '@/lib/route';
import type { Draft, DraftDay, DraftStay } from '@/types/itinerary';

interface Props {
  readonly draft: Draft;
  readonly day: DraftDay | undefined;
  readonly index: number;
  readonly onSelect: (index: number) => void;
}

export default function DayScreen({ draft, day, index, onSelect }: Props) {
  const stay: DraftStay | null =
    draft.stays.find((s) => s.key.trim() && s.key.trim() === day?.stayId.trim()) ?? null;

  const blocks = day?.items.filter((i) => i.title.trim() || i.description.trim()) ?? [];
  const notes = day?.notes.filter((n) => n.trim()) ?? [];
  const route = day ? buildRoute(day, stay) : [];
  const kicker = [`DAY ${index + 1} OF ${draft.days.length}`, day?.base.toUpperCase()]
    .filter(Boolean)
    .join('  ·  ');

  return (
    <>
      <div className="shrink-0 bg-primary px-4 pb-3 pt-4">
        <div className="flex items-center gap-2">
          <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white/15 text-white">
            {'\u{2039}'}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[17px] font-extrabold tracking-tight text-white">
              {draft.trip.title || 'Trip'}
            </div>
            {draft.trip.subtitle ? (
              <div className="truncate text-[12px] text-white/70">{draft.trip.subtitle}</div>
            ) : null}
          </div>
          {['\u{21BB}', '\u{2139}', '\u{2699}'].map((g) => (
            <span key={g} className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white/15 text-white">
              {g}
            </span>
          ))}
        </div>
      </div>

      <div className="phone-scroll flex-1 overflow-y-auto px-4 pb-6">
        {!day ? (
          <p className="py-20 text-center text-sm text-faint">No day selected.</p>
        ) : (
          <>
            {day.image ? (
              <div className="relative mb-4 mt-4 h-[200px] overflow-hidden rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={day.image} alt={day.title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-primaryDark/35" />
                <div className="absolute bottom-0 p-4">
                  <div className="text-[11px] font-bold uppercase tracking-[1.1px] text-white/85">{`DAY ${index + 1} OF ${draft.days.length}`}</div>
                  {day.title ? (
                    <div className="mt-1 text-[25px] font-extrabold leading-tight tracking-tight text-white">
                      {day.title}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            <div className={day.image ? '' : 'pt-4'}>
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-[11px] font-bold uppercase tracking-[1.1px] text-accent">
                  {day.image ? day.base.toUpperCase() : kicker}
                </span>
                <span className="rounded-full bg-sunken px-2.5 py-1 text-[11.5px] font-bold text-muted">
                  {day.date || 'No date'}
                </span>
              </div>

              {!day.image && day.title ? (
                <h2 className="mt-2 text-[26px] font-extrabold leading-tight tracking-tight text-ink">{day.title}</h2>
              ) : null}
              <div className="mt-1 text-[13px] text-muted">{longDate(day.date)}</div>
              {day.summary ? (
                <p className="mt-3 text-[15px] leading-[22px] text-muted">{day.summary}</p>
              ) : null}
            </div>

            {blocks.length === 0 ? (
              <div className="py-14 text-center">
                <div className="text-3xl">{'\u{1F334}'}</div>
                <p className="mt-2 text-[15px] text-muted">Nothing scheduled. Enjoy the day.</p>
              </div>
            ) : (
              <>
                <h3 className="mb-2 mt-6 text-[11px] font-bold uppercase tracking-[1.1px] text-accent">Schedule</h3>
                {blocks.map((block) => (
                  <ScheduleBlock key={block.id} block={block} />
                ))}
              </>
            )}

            {stay ? (
              <>
                <h3 className="mb-2 mt-6 text-[11px] font-bold uppercase tracking-[1.1px] text-accent">Stay</h3>
                <div className="rounded-lg border border-lineSoft bg-white p-4 shadow-sm">
                  <div className="text-[16px] font-bold text-ink">{stay.name || 'Unnamed stay'}</div>
                  {stay.city ? <div className="text-[13px] text-muted">{stay.city}</div> : null}
                  {stay.checkIn || stay.checkOut ? (
                    <div className="mt-2 text-[13px] text-muted">
                      {stay.checkIn || '?'} {'\u{2192}'} {stay.checkOut || '?'}
                    </div>
                  ) : null}
                  {stay.notes ? <p className="mt-2 text-[13px] leading-[18px] text-muted">{stay.notes}</p> : null}
                </div>
              </>
            ) : null}

            {notes.length > 0 ? (
              <>
                <h3 className="mb-2 mt-6 text-[11px] font-bold uppercase tracking-[1.1px] text-accent">Notes</h3>
                <ul className="space-y-2">
                  {notes.map((note, i) => (
                    <li key={i} className="flex gap-2 rounded-md border border-lineSoft bg-white p-3">
                      <span className="text-accent">{'\u{2022}'}</span>
                      <span className="text-[13px] leading-[18px] text-muted">{note}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            {route.length > 1 ? (
              <>
                <h3 className="mb-2 mt-6 text-[11px] font-bold uppercase tracking-[1.1px] text-accent">Day route</h3>
                <RoutePreview stops={route} />
              </>
            ) : null}
          </>
        )}
      </div>

      <DateStrip days={draft.days} selectedId={day?.id ?? ''} onSelect={onSelect} />
    </>
  );
}
