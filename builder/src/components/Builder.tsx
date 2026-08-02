'use client';

import { useState } from 'react';
import DayEditor from '@/components/DayEditor';
import DayRail from '@/components/DayRail';
import InfoEditor from '@/components/InfoEditor';
import IssueList from '@/components/IssueList';
import StaysEditor from '@/components/StaysEditor';
import Toolbar from '@/components/Toolbar';
import TripSettings from '@/components/TripSettings';
import DayScreen from '@/components/preview/DayScreen';
import InfoScreen from '@/components/preview/InfoScreen';
import JsonScreen from '@/components/preview/JsonScreen';
import PhoneFrame from '@/components/preview/PhoneFrame';
import { useDraft } from '@/lib/useDraft';

const EDITOR_TABS = ['Days', 'Trip', 'Stays', 'Info', 'Checks'] as const;
const PREVIEW_TABS = ['Day', 'Info', 'JSON'] as const;

type EditorTab = (typeof EDITOR_TABS)[number];
type PreviewTab = (typeof PREVIEW_TABS)[number];

export default function Builder() {
  const api = useDraft();
  const [tab, setTab] = useState<EditorTab>('Days');
  const [preview, setPreview] = useState<PreviewTab>('Day');

  const index = Math.min(api.dayIndex, Math.max(0, api.draft.days.length - 1));
  const day = api.draft.days[index];

  if (!api.ready) {
    return <div className="p-10 text-sm text-muted">Loading your trip…</div>;
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Toolbar api={api} />

      <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 lg:flex-row">
        <main className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
          <nav className="flex shrink-0 flex-wrap gap-1.5">
            {EDITOR_TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                  tab === t ? 'bg-primary text-white' : 'bg-white text-muted hover:text-primary'
                }`}
              >
                {t}
              </button>
            ))}
          </nav>

          {tab === 'Days' ? <DayRail api={api} /> : null}

          {/* Only this pane scrolls. The page itself never does. */}
          <div className="min-h-0 flex-1 overflow-y-auto pb-4 pr-1">
            {tab === 'Days' && day ? (
              <DayEditor
                day={day}
                index={index}
                total={api.draft.days.length}
                stays={api.draft.stays}
                api={api}
              />
            ) : null}

            {tab === 'Trip' ? <TripSettings api={api} /> : null}
            {tab === 'Stays' ? <StaysEditor api={api} /> : null}
            {tab === 'Info' ? <InfoEditor api={api} /> : null}
            {tab === 'Checks' ? (
              <div className="space-y-3">
                <div>
                  <h2 className="text-lg font-extrabold tracking-tight text-ink">Checks</h2>
                  <p className="text-sm text-muted">Run through these before exporting.</p>
                </div>
                <IssueList draft={api.draft} />
              </div>
            ) : null}
          </div>
        </main>

        <aside className="flex min-h-0 flex-1 flex-col gap-3 lg:w-[42%] lg:min-w-[380px] lg:max-w-[560px] lg:flex-none">
          <div className="flex shrink-0 justify-center gap-1.5">
            {PREVIEW_TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setPreview(t)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                  preview === t ? 'bg-ink text-white' : 'bg-white text-muted hover:text-ink'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <PhoneFrame>
            {preview === 'Day' ? (
              <DayScreen draft={api.draft} day={day} index={index} onSelect={api.setDayIndex} />
            ) : null}
            {preview === 'Info' ? <InfoScreen draft={api.draft} /> : null}
            {preview === 'JSON' ? (
              <JsonScreen
                draft={api.draft}
                onApply={(next) => {
                  api.setDraft(next);
                  api.setDayIndex(0);
                }}
              />
            ) : null}
          </PhoneFrame>
        </aside>
      </div>
    </div>
  );
}
