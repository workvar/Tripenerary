'use client';

import { useRef, useState } from 'react';
import { parseDraft } from '@/lib/importJson';
import { mergeDraft, summarise, type MergeMode } from '@/lib/merge';
import type { Draft } from '@/types/itinerary';

type Source = 'file' | 'paste' | 'url';

const SOURCES: readonly { readonly id: Source; readonly label: string }[] = [
  { id: 'file', label: 'From a file' },
  { id: 'paste', label: 'Paste JSON' },
  { id: 'url', label: 'From a URL' },
];

const MODES: readonly { readonly id: MergeMode; readonly label: string; readonly hint: string }[] = [
  { id: 'replace', label: 'Replace everything', hint: 'The file becomes the whole trip.' },
  { id: 'append', label: 'Add to this trip', hint: 'Days merge in by date, new stays and info are added.' },
  { id: 'days-only', label: 'Days only', hint: 'Keep the current settings, take just the days.' },
];

interface Props {
  readonly current: Draft;
  readonly onApply: (draft: Draft) => void;
  readonly onClose: () => void;
}

export default function ImportDialog({ current, onApply, onClose }: Props) {
  const [source, setSource] = useState<Source>('file');
  const [mode, setMode] = useState<MergeMode>('replace');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [staged, setStaged] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const stage = (raw: string) => {
    const result = parseDraft(raw);
    if (!result.ok) {
      setError(result.error);
      setStaged(null);
      return;
    }
    setError(null);
    setStaged(result.draft);
  };

  const readFile = async (file: File) => {
    const raw = await file.text();
    setText(raw);
    stage(raw);
  };

  const fetchUrl = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`The server answered ${res.status}.`);
      const raw = await res.text();
      setText(raw);
      stage(raw);
    } catch (e) {
      setError(
        e instanceof Error
          ? `${e.message} If this is a browser CORS block, download the file and use the file tab.`
          : 'Could not fetch that URL.'
      );
      setStaged(null);
    } finally {
      setBusy(false);
    }
  };

  const apply = () => {
    if (!staged) return;
    onApply(mergeDraft(current, staged, mode));
    onClose();
  };

  const summary = staged ? summarise(staged) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" onClick={onClose}>
      <div
        className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-ink">Import itinerary JSON</h2>
            <p className="text-sm text-muted">Load an existing file, then keep editing it here.</p>
          </div>
          <button type="button" className="btn-mini" onClick={onClose}>
            {'\u{2715}'}
          </button>
        </div>

        <div className="mb-3 flex gap-1.5">
          {SOURCES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSource(s.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                source === s.id ? 'bg-primary text-white' : 'bg-sunken text-muted hover:text-primary'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {source === 'file' ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) void readFile(file);
            }}
            className="rounded-md border border-dashed border-line bg-elevated p-8 text-center"
          >
            <p className="text-sm text-muted">Drop a .json file here</p>
            <button type="button" className="btn-ghost mt-3 !py-1.5 !text-xs" onClick={() => fileRef.current?.click()}>
              Choose a file
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void readFile(file);
                e.target.value = '';
              }}
            />
          </div>
        ) : null}

        {source === 'paste' ? (
          <textarea
            className="field h-48 resize-y font-mono text-[12px]"
            placeholder='{ "trip": { ... }, "days": [ ... ] }'
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (e.target.value.trim()) stage(e.target.value);
              else setStaged(null);
            }}
          />
        ) : null}

        {source === 'url' ? (
          <div className="flex gap-2">
            <input
              className="field"
              placeholder="https://example.com/itinerary.json"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button type="button" className="btn-ghost !text-xs" disabled={!url.trim() || busy} onClick={fetchUrl}>
              {busy ? 'Fetching…' : 'Fetch'}
            </button>
          </div>
        ) : null}

        {error ? (
          <p className="mt-3 rounded-sm border border-danger/25 bg-dangerSoft p-3 text-[13px] text-danger">{error}</p>
        ) : null}

        {summary ? (
          <div className="mt-4 rounded-md border border-lineSoft bg-elevated p-3">
            <div className="text-sm font-bold text-ink">{summary.title || 'Untitled trip'}</div>
            <div className="mt-1 text-[13px] text-muted">
              {summary.days} days · {summary.blocks} blocks · {summary.stays} stays · {summary.info} info sections ·{' '}
              {summary.contacts} contacts
            </div>
          </div>
        ) : null}

        <div className="mt-4 space-y-1.5">
          <span className="label">How should it land?</span>
          {MODES.map((m) => (
            <label
              key={m.id}
              className={`flex cursor-pointer gap-3 rounded-sm border p-3 transition ${
                mode === m.id ? 'border-primary bg-primarySoft' : 'border-line bg-white hover:border-primary/40'
              }`}
            >
              <input
                type="radio"
                name="merge-mode"
                className="mt-1"
                checked={mode === m.id}
                onChange={() => setMode(m.id)}
              />
              <span>
                <span className="block text-sm font-bold text-ink">{m.label}</span>
                <span className="block text-[12px] text-muted">{m.hint}</span>
              </span>
            </label>
          ))}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="btn-ghost !text-xs" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-primary !text-xs" disabled={!staged} onClick={apply}>
            Import and edit
          </button>
        </div>
      </div>
    </div>
  );
}
