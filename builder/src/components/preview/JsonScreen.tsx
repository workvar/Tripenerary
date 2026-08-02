'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import { toJsonString } from '@/lib/exportJson';
import { parseDraft } from '@/lib/importJson';
import { rekeyDraft } from '@/lib/merge';
import type { Draft } from '@/types/itinerary';

interface Props {
  readonly draft: Draft;
  readonly onApply: (draft: Draft) => void;
}

/** Read-only by default. Switching to edit lets you hand-edit the JSON and push
 *  it back into the forms, which is faster than clicking through for bulk fixes. */
export default function JsonScreen({ draft, onApply }: Props) {
  const json = toJsonString(draft);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(json);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // While read-only, follow the draft. While editing, leave the buffer alone.
  useEffect(() => {
    if (!editing) setText(json);
  }, [json, editing]);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const apply = () => {
    const result = parseDraft(text);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
    setEditing(false);
    onApply(rekeyDraft(result.draft));
  };

  const cancel = () => {
    setText(json);
    setError(null);
    setEditing(false);
  };

  return (
    <>
      <div className="flex shrink-0 items-center gap-2 bg-primary px-4 pb-3 pt-4">
        <div className="flex-1 truncate text-[17px] font-extrabold tracking-tight text-white">
          itinerary.json
        </div>

        {editing ? (
          <>
            <Button size="sm" variant="inverse" onClick={cancel}>
              Cancel
            </Button>
            <Button size="sm" variant="accent" onClick={apply}>
              Apply
            </Button>
          </>
        ) : (
          <>
            <Button size="sm" variant="inverse" onClick={copy}>
              {copied ? 'Copied' : 'Copy'}
            </Button>
            <Button size="sm" variant="inverse" onClick={() => setEditing(true)}>
              Edit
            </Button>
          </>
        )}
      </div>

      {error ? (
        <div className="shrink-0 border-b border-danger/30 bg-dangerSoft px-4 py-2 text-[12px] font-semibold text-danger">
          {error}
        </div>
      ) : null}

      {editing ? (
        <textarea
          className="phone-scroll flex-1 resize-none bg-[#0b1f1e] p-4 font-mono text-[11px] leading-[16px] text-[#DCEBE9] outline-none"
          value={text}
          spellCheck={false}
          onChange={(e) => setText(e.target.value)}
        />
      ) : (
        <pre className="phone-scroll flex-1 overflow-auto bg-[#0b1f1e] p-4 text-[11px] leading-[16px] text-[#B9D8D5]">
          {json}
        </pre>
      )}

      <div className="shrink-0 bg-primaryDark px-4 py-2 text-center text-[11px] text-white/60">
        {editing ? 'Apply replaces the whole trip with what is written here.' : 'Edit to hand-tune the JSON.'}
      </div>
    </>
  );
}
