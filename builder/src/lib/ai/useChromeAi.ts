'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { checkAvailability, createSession, tidy, type SessionHandle } from '@/lib/ai/client';
import { buildPrompt, type AiRequest } from '@/lib/ai/prompts';
import type { AiStatus, Availability } from '@/lib/ai/types';

function statusFor(availability: Availability): AiStatus {
  if (availability === 'available') return 'ready';
  if (availability === 'downloadable') return 'needs-download';
  if (availability === 'downloading') return 'downloading';
  return 'unsupported';
}

/** One shared session per component that uses AI. Created lazily on first run so
 *  merely opening the builder never triggers a model download. */
export default function useChromeAi() {
  const [status, setStatus] = useState<AiStatus>('checking');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const handleRef = useRef<SessionHandle | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let alive = true;
    void checkAvailability().then((a) => {
      if (alive) setStatus(statusFor(a));
    });
    return () => {
      alive = false;
      abortRef.current?.abort();
      handleRef.current?.release();
      handleRef.current = null;
    };
  }, []);

  const generate = useCallback(async (request: AiRequest): Promise<string | null> => {
    setError(null);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      if (!handleRef.current) {
        setStatus('downloading');
        handleRef.current = await createSession((f) => setProgress(f), controller.signal);
      }

      setStatus('working');
      const raw = await handleRef.current.session.prompt(buildPrompt(request), {
        signal: controller.signal,
      });
      setStatus('ready');
      return tidy(raw);
    } catch (e) {
      if (controller.signal.aborted) {
        setStatus('ready');
        return null;
      }
      // A failed session is usually unusable, so drop it and rebuild next time.
      handleRef.current?.release();
      handleRef.current = null;
      setStatus('error');
      setError(e instanceof Error ? e.message : 'The on-device model could not answer.');
      return null;
    } finally {
      abortRef.current = null;
    }
  }, []);

  const cancel = useCallback(() => abortRef.current?.abort(), []);

  const recheck = useCallback(async () => {
    setStatus('checking');
    setStatus(statusFor(await checkAvailability()));
  }, []);

  const busy = status === 'working' || status === 'downloading';
  const usable = status === 'ready' || status === 'needs-download' || status === 'error';

  return { status, progress, error, busy, usable, generate, cancel, recheck };
}
