'use client';

import { useState } from 'react';
import AuthModal from '@/components/AuthModal';
import ImportDialog from '@/components/ImportDialog';
import PdfButton from '@/components/PdfButton';
import Button from '@/components/ui/Button';
import { suggestedFilename, toJsonString } from '@/lib/exportJson';
import { useAuth } from '@/lib/useAuth';
import type { DraftApi } from '@/lib/useDraft';
import type { Draft } from '@/types/itinerary';

function saveLabel(api: DraftApi, signedIn: boolean): string {
  if (!signedIn) return 'Local only';
  switch (api.saveStatus) {
    case 'saving':
      return 'Saving…';
    case 'saved':
      return `Saved · ${api.formatBytes(api.cloudMeta.bytes || api.localBytes)} / 20 MB`;
    case 'over-limit':
      return `Over 20 MB · ${api.formatBytes(api.localBytes)}`;
    case 'error':
      return 'Save failed';
    default:
      return `Cloud · ${api.formatBytes(api.localBytes)} / 20 MB`;
  }
}

export default function Toolbar({ api }: { readonly api: DraftApi }) {
  const auth = useAuth();
  const { draft, setDraft, setDayIndex, reset, publish, publishBusy, message, flash, cloudMeta } = api;
  const [importing, setImporting] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const issuesReady = draft.days.length > 0;

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

  const onReset = () => {
    if (!window.confirm('Discard the current trip and start over?')) return;
    reset();
  };

  const onPublish = async () => {
    if (!auth.uid) {
      setAuthOpen(true);
      return;
    }
    const url = await publish();
    if (url) {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {
        // Clipboard may be blocked; URL still shown below.
      }
    }
  };

  const copyPublished = async () => {
    if (!cloudMeta.publishedUrl) return;
    try {
      await navigator.clipboard.writeText(cloudMeta.publishedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      flash('Link copied. Paste it in the Tripenerary app to add the trip.');
    } catch {
      flash('Could not copy. Select the link manually.');
    }
  };

  return (
    <>
      <header className="z-30 shrink-0 border-b border-line bg-white/90 backdrop-blur">
        <div className="flex flex-wrap items-center gap-3 px-5 py-3">
          <div className="mr-auto flex min-w-0 items-center gap-2.5">
            <img
              src="/favicon.png"
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 shrink-0 rounded-sm"
              decoding="async"
            />
            <div className="min-w-0">
              <h1 className="text-sm font-extrabold tracking-tight text-ink">Trip Companion Builder</h1>
              <p className="truncate text-[11px] text-muted">
                {draft.days.length} {draft.days.length === 1 ? 'day' : 'days'}
                {' · '}
                <span
                  className={
                    api.saveStatus === 'over-limit' || api.saveStatus === 'error'
                      ? 'font-bold text-danger'
                      : api.saveStatus === 'saved'
                        ? 'font-bold text-primary'
                        : ''
                  }
                >
                  {saveLabel(api, Boolean(auth.uid))}
                </span>
                {issuesReady ? null : <span className="ml-1 font-bold text-danger">· add a day</span>}
              </p>
            </div>
          </div>

          {message ? (
            <span className="rounded-sm bg-primarySoft px-3 py-1.5 text-xs font-semibold text-primary">
              {message}
            </span>
          ) : null}

          {auth.user ? (
            <Button size="sm" onClick={() => void auth.signOut()} title={auth.email ?? undefined}>
              Sign out
            </Button>
          ) : (
            <Button size="sm" onClick={() => setAuthOpen(true)} disabled={!auth.ready}>
              Sign in
            </Button>
          )}

          <Button size="sm" onClick={onReset}>
            New
          </Button>
          <Button size="sm" onClick={() => setImporting(true)}>
            Import JSON
          </Button>
          <PdfButton draft={draft} label="PDF · all days" />
          <Button size="sm" onClick={exportFile}>
            Export JSON
          </Button>
          <Button size="sm" variant="primary" disabled={publishBusy} onClick={() => void onPublish()}>
            {publishBusy ? 'Publishing…' : 'Publish link'}
          </Button>
        </div>

        {cloudMeta.publishedUrl ? (
          <div className="flex flex-wrap items-center gap-2 border-t border-lineSoft bg-elevated px-5 py-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Shareable link</span>
            <code className="min-w-0 flex-1 truncate rounded-sm bg-white px-2 py-1 text-[11px] text-ink">
              {cloudMeta.publishedUrl}
            </code>
            <Button size="xs" variant="subtle" onClick={() => void copyPublished()}>
              {copied ? 'Copied' : 'Copy for app'}
            </Button>
          </div>
        ) : null}
      </header>

      {importing ? (
        <ImportDialog current={draft} onApply={applyImport} onClose={() => setImporting(false)} />
      ) : null}

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} auth={auth} />
    </>
  );
}
