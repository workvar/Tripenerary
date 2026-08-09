'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { addDays } from '@/lib/dates';
import {
  formatBytes,
  loadCloudDraft,
  loadCloudMeta,
  publishDraft,
  saveCloudDraft,
  type CloudMeta,
  type SaveStatus,
} from '@/lib/cloud';
import { exportByteLength } from '@/lib/exportJson';
import { MAX_CLOUD_BYTES } from '@/lib/firebase';
import { newBlock, newDay, newDraft } from '@/lib/factories';
import { clearDraft, loadDraft, saveDraft } from '@/lib/storage';
import { useAuth } from '@/lib/useAuth';
import type { Draft, DraftBlock, DraftDay } from '@/types/itinerary';

const SAVE_DELAY = 400;
const CLOUD_SAVE_DELAY = 1200;

const move = <T,>(list: T[], from: number, to: number): T[] => {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  if (item) next.splice(to, 0, item);
  return next;
};

export function useDraft() {
  const auth = useAuth();
  const [draft, setDraft] = useState<Draft>(newDraft);
  const [ready, setReady] = useState(false);
  const [dayIndex, setDayIndex] = useState(0);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [cloudMeta, setCloudMeta] = useState<CloudMeta>({
    updatedAt: null,
    bytes: 0,
    publishedUrl: null,
    publishedAt: null,
    publishId: null,
  });
  const [publishBusy, setPublishBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cloudTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncedUid = useRef<string | null>(null);
  const draftRef = useRef(draft);
  draftRef.current = draft;

  // Hydrate after mount so server and client markup match on first paint.
  useEffect(() => {
    setDraft(loadDraft());
    setReady(true);
  }, []);

  // Local autosave
  useEffect(() => {
    if (!ready) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => saveDraft(draft), SAVE_DELAY);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [draft, ready]);

  // Pull cloud draft once when signed in.
  useEffect(() => {
    if (!ready || !auth.ready) return;
    if (!auth.uid) {
      syncedUid.current = null;
      setSaveStatus('unsigned');
      return;
    }
    if (syncedUid.current === auth.uid) return;

    const uid = auth.uid;
    let cancelled = false;

    void (async () => {
      setSaveStatus('saving');
      try {
        const [remote, meta] = await Promise.all([loadCloudDraft(uid), loadCloudMeta(uid)]);
        if (cancelled) return;
        setCloudMeta(meta);
        if (remote) {
          setDraft(remote);
          saveDraft(remote);
        } else {
          // First login: push the browser draft up.
          const res = await saveCloudDraft(uid, draftRef.current);
          if (res.ok) {
            setCloudMeta((m) => ({ ...m, updatedAt: res.updatedAt, bytes: res.bytes }));
          }
        }
        syncedUid.current = uid;
        setSaveStatus('saved');
      } catch {
        if (!cancelled) setSaveStatus('error');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, auth.ready, auth.uid]);

  // Cloud autosave while signed in.
  useEffect(() => {
    if (!ready || !auth.uid || syncedUid.current !== auth.uid) return;
    if (cloudTimer.current) clearTimeout(cloudTimer.current);

    const bytes = exportByteLength(draft);
    if (bytes > MAX_CLOUD_BYTES) {
      setSaveStatus('over-limit');
      return;
    }

    setSaveStatus('saving');
    cloudTimer.current = setTimeout(() => {
      void (async () => {
        const res = await saveCloudDraft(auth.uid!, draft);
        if (!res.ok) {
          setSaveStatus(res.overLimit ? 'over-limit' : 'error');
          if (res.error) setMessage(res.error);
          return;
        }
        setCloudMeta((m) => ({ ...m, updatedAt: res.updatedAt, bytes: res.bytes }));
        setSaveStatus('saved');
      })();
    }, CLOUD_SAVE_DELAY);

    return () => {
      if (cloudTimer.current) clearTimeout(cloudTimer.current);
    };
  }, [draft, ready, auth.uid]);

  const flash = useCallback((text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(null), 4000);
  }, []);

  const publish = useCallback(async (): Promise<string | null> => {
    if (!auth.uid) {
      flash('Sign in to publish a shareable link.');
      return null;
    }
    setPublishBusy(true);
    const res = await publishDraft(auth.uid, draftRef.current, cloudMeta.publishId);
    setPublishBusy(false);
    if (!res.ok) {
      flash(res.error);
      if (res.overLimit) setSaveStatus('over-limit');
      return null;
    }
    setCloudMeta((m) => ({
      ...m,
      publishedUrl: res.url,
      publishedAt: res.publishedAt,
      publishId: res.publishId,
      bytes: res.bytes,
      updatedAt: res.publishedAt,
    }));
    setSaveStatus('saved');
    flash('Published. Copy the link into the Tripenerary app.');
    return res.url;
  }, [auth.uid, cloudMeta.publishId, flash]);

  const patchTrip = useCallback((patch: Partial<Draft['trip']>) => {
    setDraft((d) => ({ ...d, trip: { ...d.trip, ...patch } }));
  }, []);

  const patchDay = useCallback((id: string, patch: Partial<DraftDay>) => {
    setDraft((d) => ({
      ...d,
      days: d.days.map((day) => (day.id === id ? { ...day, ...patch } : day)),
    }));
  }, []);

  const patchBlock = useCallback((dayId: string, blockId: string, patch: Partial<DraftBlock>) => {
    setDraft((d) => ({
      ...d,
      days: d.days.map((day) =>
        day.id !== dayId
          ? day
          : { ...day, items: day.items.map((b) => (b.id === blockId ? { ...b, ...patch } : b)) }
      ),
    }));
  }, []);

  const addDay = useCallback(() => {
    setDraft((d) => {
      const last = d.days[d.days.length - 1];
      const date = last?.date ? addDays(last.date, 1) : d.trip.startDate;
      const day = { ...newDay(date), base: last?.base ?? '', stayId: last?.stayId ?? '' };
      return { ...d, days: [...d.days, day], trip: { ...d.trip, endDate: date } };
    });
    setDayIndex((i) => i + 1);
  }, []);

  const removeDay = useCallback((id: string) => {
    setDraft((d) => {
      if (d.days.length <= 1) return d;
      return { ...d, days: d.days.filter((day) => day.id !== id) };
    });
    setDayIndex((i) => Math.max(0, i - 1));
  }, []);

  const duplicateDay = useCallback((id: string) => {
    setDraft((d) => {
      const i = d.days.findIndex((day) => day.id === id);
      const source = d.days[i];
      if (!source) return d;
      const copy: DraftDay = {
        ...source,
        ...newDay(addDays(source.date, 1)),
        base: source.base,
        title: source.title,
        summary: source.summary,
        stayId: source.stayId,
        notes: [...source.notes],
        image: source.image,
        items: source.items.map((b) => ({ ...newBlock(), ...b, id: newBlock().id })),
      };
      const days = [...d.days];
      days.splice(i + 1, 0, copy);
      return { ...d, days };
    });
  }, []);

  const moveDay = useCallback((id: string, delta: number) => {
    setDraft((d) => {
      const i = d.days.findIndex((day) => day.id === id);
      return i < 0 ? d : { ...d, days: move(d.days, i, i + delta) };
    });
    setDayIndex((i) => i + delta);
  }, []);

  const addBlock = useCallback((dayId: string) => {
    setDraft((d) => ({
      ...d,
      days: d.days.map((day) =>
        day.id === dayId ? { ...day, items: [...day.items, newBlock()] } : day
      ),
    }));
  }, []);

  const removeBlock = useCallback((dayId: string, blockId: string) => {
    setDraft((d) => ({
      ...d,
      days: d.days.map((day) =>
        day.id === dayId ? { ...day, items: day.items.filter((b) => b.id !== blockId) } : day
      ),
    }));
  }, []);

  const moveBlock = useCallback((dayId: string, blockId: string, delta: number) => {
    setDraft((d) => ({
      ...d,
      days: d.days.map((day) => {
        if (day.id !== dayId) return day;
        const i = day.items.findIndex((b) => b.id === blockId);
        return i < 0 ? day : { ...day, items: move(day.items, i, i + delta) };
      }),
    }));
  }, []);

  const reset = useCallback(() => {
    const next = newDraft();
    setDraft(next);
    setDayIndex(0);
    clearDraft();
    saveDraft(next);
  }, []);

  const localBytes = exportByteLength(draft);

  return {
    draft,
    setDraft,
    ready,
    dayIndex,
    setDayIndex,
    patchTrip,
    patchDay,
    patchBlock,
    addDay,
    removeDay,
    duplicateDay,
    moveDay,
    addBlock,
    removeBlock,
    moveBlock,
    reset,
    saveStatus,
    cloudMeta,
    localBytes,
    maxBytes: MAX_CLOUD_BYTES,
    formatBytes,
    publish,
    publishBusy,
    message,
    flash,
  };
}

export type DraftApi = ReturnType<typeof useDraft>;
