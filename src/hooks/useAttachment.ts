import { useCallback, useEffect, useRef, useState } from 'react';
import {
  cachedSize,
  downloadAttachment,
  isCached,
  openCached,
  openRemote,
} from '@/lib/cache';
import type { Attachment } from '@/types';

export type AttachmentState = 'remote' | 'downloading' | 'cached';

export interface AttachmentControl {
  readonly state: AttachmentState;
  readonly bytes: number;
  readonly error: string;
  readonly open: () => void;
}

/**
 * One document's lifecycle from the row's point of view.
 *
 * A tap downloads it if it is not already on disk, then opens the local copy.
 * If the download fails — no signal, file too large, dead link — the original URL
 * is handed to the OS instead, so tapping still does something useful whenever
 * there is a connection.
 */
export default function useAttachment(
  tripId: string | null,
  attachment: Attachment
): AttachmentControl {
  const [state, setState] = useState<AttachmentState>('remote');
  const [bytes, setBytes] = useState(0);
  const [error, setError] = useState('');
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  // Re-read on mount and whenever the trip or URL changes: a refresh may have
  // swept this file away, or pulled a newer copy in.
  useEffect(() => {
    if (!tripId) {
      setState('remote');
      setBytes(0);
      return;
    }
    setState(isCached(tripId, attachment) ? 'cached' : 'remote');
    setBytes(cachedSize(tripId, attachment));
  }, [tripId, attachment]);

  const open = useCallback(() => {
    void (async () => {
      setError('');

      if (!tripId) {
        if (!(await openRemote(attachment))) setError('Could not open that document.');
        return;
      }

      if (isCached(tripId, attachment)) {
        if (await openCached(tripId, attachment)) return;
        // A cached file the phone cannot display is still better served remotely.
        if (!(await openRemote(attachment))) setError('No app on this phone can open it.');
        return;
      }

      setState('downloading');
      const result = await downloadAttachment(tripId, attachment);
      if (!alive.current) return;

      if (!result.ok) {
        setState('remote');
        const opened = await openRemote(attachment);
        if (alive.current && !opened) setError(result.error);
        return;
      }

      setState('cached');
      setBytes(cachedSize(tripId, attachment));
      if (!(await openCached(tripId, attachment))) {
        if (!(await openRemote(attachment))) setError('No app on this phone can open it.');
      }
    })();
  }, [tripId, attachment]);

  return { state, bytes, error, open };
}
