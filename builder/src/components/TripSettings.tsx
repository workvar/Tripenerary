'use client';

import { Grid2, Grid3, Text } from '@/components/Field';
import AttachmentFields from '@/components/AttachmentFields';
import Button from '@/components/ui/Button';
import Chip from '@/components/ui/Chip';
import AiFillButton from '@/components/ai/AiFillButton';
import { addDays, daysBetween, isDateKey } from '@/lib/dates';
import { newDay } from '@/lib/factories';
import { tripStats } from '@/lib/stats';
import type { DraftApi } from '@/lib/useDraft';

const TIMEZONES = [
  'Asia/Bangkok',
  'Asia/Kolkata',
  'Asia/Dubai',
  'Asia/Tokyo',
  'Asia/Singapore',
  'Europe/London',
  'Europe/Paris',
  'America/New_York',
  'America/Los_Angeles',
  'Australia/Sydney',
];

export default function TripSettings({ api }: { readonly api: DraftApi }) {
  const { draft, patchTrip, setDraft } = api;
  const stats = tripStats(draft);
  const span =
    isDateKey(draft.trip.startDate) && isDateKey(draft.trip.endDate)
      ? daysBetween(draft.trip.startDate, draft.trip.endDate) + 1
      : 0;

  /** Rebuilds days[] to match the date range, keeping whatever is already planned. */
  const syncDays = () => {
    if (span < 1) return;
    setDraft((d) => {
      const byDate = new Map(d.days.map((day) => [day.date, day]));
      const days = Array.from({ length: span }, (_, i) => {
        const date = addDays(d.trip.startDate, i);
        const existing = byDate.get(date);
        return existing ?? newDay(date);
      });
      return { ...d, days };
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-extrabold tracking-tight text-ink">Trip master</h2>
        <p className="text-sm text-muted">Everything that is true for the whole trip.</p>
      </div>

      <div className="card space-y-3">
        <Text label="Title" value={draft.trip.title} onChange={(v) => patchTrip({ title: v })} placeholder="Thailand: A Relaxed 12-Day Journey" />
        <Text
          label="Subtitle"
          value={draft.trip.subtitle}
          onChange={(v) => patchTrip({ subtitle: v })}
          placeholder="Bangkok, Khao Lak, Phuket"
          action={
            <AiFillButton
              kind="trip"
              value={draft.trip.subtitle}
              onFilled={(subtitle) => patchTrip({ subtitle })}
              facts={{
                Title: draft.trip.title,
                Cities: Array.from(new Set(draft.days.map((d) => d.base).filter(Boolean))).join(', '),
                Length: span > 0 ? `${span} days` : '',
                Travellers: draft.trip.travellers.join(', '),
              }}
            />
          }
        />

        <Grid2>
          <Text label="Start date" value={draft.trip.startDate} onChange={(v) => patchTrip({ startDate: v })} placeholder="2026-08-22" />
          <Text label="End date" value={draft.trip.endDate} onChange={(v) => patchTrip({ endDate: v })} placeholder="2026-09-02" />
        </Grid2>

        <div className="flex flex-wrap items-center gap-3 rounded-sm bg-elevated p-3">
          <span className="text-sm text-muted">
            The range covers <strong className="text-ink">{span || '—'}</strong> days. You currently have{' '}
            <strong className="text-ink">{stats.days}</strong>.
          </span>
          <Button size="sm" disabled={span < 1 || span === stats.days} onClick={syncDays}>
            Match days to the date range
          </Button>
        </div>

        <Grid3>
          <Text label="Timezone" value={draft.trip.timezone} onChange={(v) => patchTrip({ timezone: v })} placeholder="Asia/Bangkok" />
          <Text label="Currency" value={draft.trip.currency} onChange={(v) => patchTrip({ currency: v })} placeholder="THB" />
          <Text
            label="Travellers (comma separated)"
            value={draft.trip.travellers.join(', ')}
            onChange={(v) => patchTrip({ travellers: v.split(',').map((s) => s.trim()).filter(Boolean) })}
            placeholder="Mum, Dad"
          />
        </Grid3>

        <div className="flex flex-wrap gap-1.5">
          {TIMEZONES.map((tz) => (
            <Chip
              key={tz}
              size="xs"
              active={draft.trip.timezone === tz}
              onClick={() => patchTrip({ timezone: tz })}
            >
              {tz}
            </Chip>
          ))}
        </div>

        <Text label="Cover image URL" value={draft.trip.coverImage} onChange={(v) => patchTrip({ coverImage: v })} placeholder="https://..." />

        <AttachmentFields
          attachments={draft.trip.attachments}
          onChange={(attachments) => patchTrip({ attachments })}
          label="Travel documents"
          hint="Passport scan, insurance, visa. Shown under Trip info in the app."
        />
      </div>

      <StatsPanel api={api} />
    </div>
  );
}

function StatsPanel({ api }: { readonly api: DraftApi }) {
  const stats = tripStats(api.draft);

  const cells = [
    { label: 'Days planned', value: `${stats.daysPlanned} / ${stats.days}` },
    { label: 'Blocks', value: stats.blocks },
    { label: 'Blocks pinned', value: `${stats.pinned} / ${stats.blocks}` },
    { label: 'Stays', value: stats.stays },
    { label: 'Notes', value: stats.notes },
    { label: 'Info sections', value: stats.infoSections },
  ];

  return (
    <div className="card space-y-3">
      <div className="flex items-baseline justify-between">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted">Progress</h3>
        <span className="text-2xl font-extrabold tracking-tight text-primary">{stats.percent}%</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-sunken">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${stats.percent}%` }} />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {cells.map((c) => (
          <div key={c.label} className="rounded-sm bg-elevated p-2.5">
            <div className="text-lg font-extrabold tracking-tight text-ink">{c.value}</div>
            <div className="text-[11px] text-muted">{c.label}</div>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-faint">
        A day counts as planned once it has a title and at least one block.
      </p>
    </div>
  );
}
