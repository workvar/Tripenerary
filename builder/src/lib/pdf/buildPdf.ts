import Sheet from '@/lib/pdf/sheet';
import { drawDayPage } from '@/lib/pdf/dayPage';
import { loadImages, type PdfImage } from '@/lib/pdf/images';
import { PAGE } from '@/lib/pdf/theme';
import { formatDayLabel } from '@/lib/dates';
import type { Draft } from '@/types/itinerary';

export const slug = (value: string, fallback: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || fallback;

/** jsPDF is ~350 kB, so it only arrives when someone actually asks for a PDF. */
async function newDoc(title: string) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: [PAGE.width, PAGE.height], compress: true });
  doc.setProperties({ title, creator: 'Trip Companion Builder' });
  return doc;
}

const caption = (draft: Draft, index: number): string => {
  const day = draft.days[index];
  const label = day ? formatDayLabel(day.date) : '';
  return [draft.trip.title || 'Trip', `Day ${index + 1}`, label].filter(Boolean).join('  ·  ');
};

async function render(draft: Draft, indexes: readonly number[], docTitle: string, footer: string) {
  const heroes = await loadImages(indexes.map((i) => draft.days[i]?.image ?? ''));
  const doc = await newDoc(docTitle);
  const sheet = new Sheet(doc);

  indexes.forEach((dayIndex, i) => {
    if (i > 0) sheet.newPage();
    const url = draft.days[dayIndex]?.image.trim() ?? '';
    const hero: PdfImage | null = (url && heroes.get(url)) || null;
    drawDayPage(sheet, draft, dayIndex, hero);
  });

  sheet.footer(footer);
  return doc;
}

/** One day, one file. */
export async function downloadDayPdf(draft: Draft, index: number): Promise<void> {
  const day = draft.days[index];
  if (!day) return;

  const name = `Day ${index + 1} · ${draft.trip.title || 'Trip'}`;
  const doc = await render(draft, [index], name, caption(draft, index));
  doc.save(`${slug(draft.trip.title, 'trip')}-day-${index + 1}.pdf`);
}

/** Every day, one page each, in a single file. */
export async function downloadTripPdf(draft: Draft): Promise<void> {
  if (draft.days.length === 0) return;

  const indexes = draft.days.map((_, i) => i);
  const name = draft.trip.title || 'Trip';
  const doc = await render(draft, indexes, name, name);
  doc.save(`${slug(draft.trip.title, 'trip')}-days.pdf`);
}
