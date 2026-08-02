import { newDraft } from '@/lib/factories';
import type { Draft } from '@/types/itinerary';

const KEY = 'trip-builder.draft.v1';

export function loadDraft(): Draft {
  if (typeof window === 'undefined') return newDraft();
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Draft) : newDraft();
  } catch {
    return newDraft();
  }
}

export function saveDraft(draft: Draft): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(draft));
  } catch {
    // Quota or private mode. Losing autosave is survivable; export still works.
  }
}

export function clearDraft(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(KEY);
}
