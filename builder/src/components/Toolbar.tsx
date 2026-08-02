'use client';

import { useState } from 'react';
import ImportDialog from '@/components/ImportDialog';
import Button from '@/components/ui/Button';
import { suggestedFilename, toJsonString } from '@/lib/exportJson';
import { newDraft } from '@/lib/factories';
import { validate } from '@/lib/stats';
import type { DraftApi } from '@/lib/useDraft';
import type { Draft } from '@/types/itinerary';

export default function Toolbar({ api }: { readonly api: DraftApi }) {
  const { draft, setDraft, setDayIndex } = api;
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const issues = validate(draft);
  const errors = issues.filter((i) => i.level === 'error').length;

  const flash = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(null), 3000);
  };

  const exportFile = () => {
    const blob = new Blob([toJsonString(draft)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = suggestedFilename(draft);
    a.click();
    URL.revokeObjectURL(url);
  };

  const applyImport = (next: Draft) => {
    setDraft(next);
    setDayIndex(0);
    flash(`Loaded ${next.days.length} days. Edit away.`);
  };

  const reset = () => {
    if (!window.confirm('Discard the current trip and start over?')) return;
    setDraft(newDraft());
    setDayIndex(0);
  };

  return (
    <>
      <header className="z-30 shrink-0 border-b border-line bg-white/90 backdrop-blur">
        <div className="flex flex-wrap items-center gap-3 px-5 py-3">
          <div className="mr-auto">
            <h1 className="text-sm font-extrabold tracking-tight text-ink">Trip Companion Builder</h1>
            <p className="text-[11px] text-muted">
              Autosaved to this browser · {draft.days.length} {draft.days.length === 1 ? 'day' : 'days'}
              {errors > 0 ? (
                <span className="ml-1 font-bold text-danger">· {errors} to fix</span>
              ) : (
                <span className="ml-1 font-bold text-primary">· ready to export</span>
              )}
            </p>
          </div>

          {message ? (
            <span className="rounded-sm bg-primarySoft px-3 py-1.5 text-xs font-semibold text-primary">{message}</span>
          ) : null}

          <Button size="sm" onClick={reset}>
            New
          </Button>
          <Button size="sm" onClick={() => setImporting(true)}>
            Import JSON
          </Button>
          <Button size="sm" variant="primary" onClick={exportFile}>
            Export JSON
          </Button>
        </div>
      </header>

      {importing ? (
        <ImportDialog current={draft} onApply={applyImport} onClose={() => setImporting(false)} />
      ) : null}
    </>
  );
}
