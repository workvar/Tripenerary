'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { addDays } from '@/lib/dates';
import { newBlock, newDay, newDraft } from '@/lib/factories';
import { loadDraft, saveDraft } from '@/lib/storage';
import type { Draft, DraftBlock, DraftDay } from '@/types/itinerary';

const SAVE_DELAY = 400;

const move = <T,>(list: T[], from: number, to: number): T[] => {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  if (item) next.splice(to, 0, item);
  return next;
};

export function useDraft() {
  const [draft, setDraft] = useState<Draft>(newDraft);
  const [ready, setReady] = useState(false);
  const [dayIndex, setDayIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate after mount so server and client markup match on first paint.
  useEffect(() => {
    setDraft(loadDraft());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => saveDraft(draft), SAVE_DELAY);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [draft, ready]);

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
  };
}

export type DraftApi = ReturnType<typeof useDraft>;
