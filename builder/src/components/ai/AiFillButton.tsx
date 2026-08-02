'use client';

import { useState } from 'react';
import AiSetupDialog from '@/components/ai/AiSetupDialog';
import Button from '@/components/ui/Button';
import useChromeAi from '@/lib/ai/useChromeAi';
import { hasEnoughContext, type AiKind } from '@/lib/ai/prompts';

interface Props {
  readonly kind: AiKind;
  readonly facts: Record<string, string | undefined>;
  readonly value: string;
  readonly onFilled: (text: string) => void;
}

/** Sits in a field's label row and writes that field with Chrome's on-device model. */
export default function AiFillButton({ kind, facts, value, onFilled }: Props) {
  const ai = useChromeAi();
  const [setupOpen, setSetupOpen] = useState(false);

  const thin = !hasEnoughContext(facts);
  const rewriting = value.trim().length > 0;

  const label = (() => {
    if (ai.status === 'downloading') return `Downloading ${Math.round(ai.progress * 100)}%`;
    if (ai.status === 'working') return 'Writing…';
    if (ai.status === 'checking') return 'AI';
    return rewriting ? 'AI rewrite' : 'AI write';
  })();

  const run = async () => {
    if (ai.status === 'unsupported' || ai.status === 'checking') {
      setSetupOpen(true);
      return;
    }
    const text = await ai.generate({ kind, facts, existing: value });
    if (text) onFilled(text);
  };

  const title = (() => {
    if (ai.status === 'unsupported') return 'Chrome built-in AI is not switched on. Click for setup.';
    if (thin) return 'Fill in a title or a couple of details first.';
    return rewriting ? 'Rewrite this with the on-device model' : 'Write this with the on-device model';
  })();

  return (
    <>
      <Button
        size="xs"
        variant={ai.status === 'error' ? 'danger' : 'subtle'}
        disabled={ai.busy || (thin && ai.status !== 'unsupported')}
        title={ai.error ?? title}
        onClick={() => void run()}
        className="font-bold"
      >
        <span aria-hidden>{ai.busy ? '\u{25CC}' : '\u{2726}'}</span>
        {label}
      </Button>

      {setupOpen ? (
        <AiSetupDialog onClose={() => setSetupOpen(false)} onRetry={() => void ai.recheck()} />
      ) : null}
    </>
  );
}
