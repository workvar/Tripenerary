import Sheet, { type Line } from '@/lib/pdf/sheet';
import { COLOR, GUTTER, PAGE } from '@/lib/pdf/theme';
import { longDate } from '@/lib/dates';
import { buildRoute, type RouteStop } from '@/lib/route';
import type { PdfImage } from '@/lib/pdf/images';
import type { Draft, DraftBlock, DraftDay, DraftStay } from '@/types/itinerary';
import { ITEM_TYPE_META } from '@/types/itinerary';

const BAND = 92;
const CARD_PAD = 11;
const BLOCK_GAP = 11;

const title = { size: 12.5, bold: true, color: COLOR.ink } as const;
const body = { size: 9.5, color: COLOR.muted, lead: 13 } as const;
const meta = { size: 8.5, color: COLOR.muted, lead: 12 } as const;

/** Deep green banner with the trip name and where this page sits in the trip. */
function drawBand(sheet: Sheet, draft: Draft, index: number): void {
  const { doc } = sheet;
  doc.setFillColor(COLOR.primary[0], COLOR.primary[1], COLOR.primary[2]);
  doc.rect(0, 0, PAGE.width, BAND, 'F');

  sheet.drawText(
    draft.trip.title || 'Trip',
    { size: 15, bold: true, color: COLOR.white },
    sheet.left,
    30,
    sheet.width * 0.68
  );

  if (draft.trip.subtitle) {
    sheet.drawText(
      draft.trip.subtitle,
      { size: 9, color: [214, 226, 225] },
      sheet.left,
      52,
      sheet.width * 0.68
    );
  }

  sheet.drawText(
    `DAY ${index + 1} OF ${draft.days.length}`,
    { size: 9, bold: true, color: [214, 226, 225], align: 'right' },
    sheet.left,
    32,
    sheet.width
  );

  sheet.y = BAND + 26;
}

function drawHero(sheet: Sheet, image: PdfImage): void {
  const ratio = image.height / image.width;
  const width = Math.min(sheet.width, 200 / ratio);
  const height = width * ratio;
  const x = sheet.left + (sheet.width - width) / 2;

  sheet.doc.addImage(image.dataUrl, image.format, x, sheet.y, width, height, undefined, 'FAST');
  sheet.y += height + 18;
}

function drawHeading(sheet: Sheet, day: DraftDay): void {
  const kicker = [day.base.toUpperCase(), day.date].filter(Boolean).join('   ·   ');
  if (kicker) sheet.write(kicker, { size: 8, bold: true, color: COLOR.accent, lead: 11 });

  if (day.title) sheet.write(day.title, { size: 20, bold: true, color: COLOR.ink, lead: 24 }, 4);

  const long = longDate(day.date);
  if (long) sheet.write(long, { size: 9.5, color: COLOR.muted }, 2);

  if (day.summary) sheet.write(day.summary, { size: 10.5, color: COLOR.muted, lead: 15 }, 8);
}

function blockLines(block: DraftBlock): Line[] {
  const lines: Line[] = [{ text: block.title || 'Untitled block', style: title }];

  if (block.description) lines.push({ text: block.description, style: body, gap: 5 });

  const facts = [
    block.cost,
    block.bookingRef ? `Booking ${block.bookingRef}` : '',
    block.bookingUrl && !block.bookingRef ? 'Booking link in the app' : '',
  ].filter(Boolean);

  if (facts.length > 0) {
    lines.push({
      text: facts.join('   ·   '),
      style: { size: 8.5, bold: true, color: COLOR.accent, lead: 12 },
      gap: 6,
    });
  }

  const place = block.location.name || block.location.address;
  if (place) lines.push({ text: place, style: meta, gap: 5 });

  return lines;
}

function drawBlock(sheet: Sheet, block: DraftBlock): void {
  const cardX = sheet.left + GUTTER + 10;
  const cardWidth = sheet.width - GUTTER - 10;
  const inner = cardWidth - CARD_PAD * 2;

  const lines = blockLines(block);
  const height = sheet.measureStack(lines, inner) + CARD_PAD * 2;

  sheet.ensure(height + BLOCK_GAP);

  const top = sheet.y;
  sheet.box(cardX, top, cardWidth, height, { fill: COLOR.white, border: COLOR.line });
  sheet.drawStack(lines, cardX + CARD_PAD, top + CARD_PAD, inner);

  let gutterY = top + CARD_PAD;
  gutterY += sheet.drawText(
    block.time || 'Any time',
    { size: 10, bold: true, color: COLOR.primary, lead: 13 },
    sheet.left,
    gutterY,
    GUTTER
  );

  if (block.endTime) {
    gutterY += sheet.drawText(
      `to ${block.endTime}`,
      { size: 8, color: COLOR.faint, lead: 11 },
      sheet.left,
      gutterY,
      GUTTER
    );
  }

  sheet.drawText(
    ITEM_TYPE_META[block.type].label,
    { size: 7.5, bold: true, color: COLOR.muted, lead: 11 },
    sheet.left,
    gutterY + 2,
    GUTTER
  );

  sheet.y = top + height + BLOCK_GAP;
}

function drawStay(sheet: Sheet, stay: DraftStay): void {
  const lines: Line[] = [{ text: stay.name || 'Unnamed stay', style: title }];

  const where = [stay.city, stay.address].filter(Boolean).join(' · ');
  if (where) lines.push({ text: where, style: meta, gap: 4 });

  const dates = stay.checkIn || stay.checkOut ? `${stay.checkIn || '?'} to ${stay.checkOut || '?'}` : '';
  const facts = [dates, stay.phone, stay.confirmation ? `Ref ${stay.confirmation}` : ''].filter(Boolean);
  if (facts.length > 0) lines.push({ text: facts.join('   ·   '), style: meta, gap: 4 });

  if (stay.notes) lines.push({ text: stay.notes, style: body, gap: 5 });

  const inner = sheet.width - CARD_PAD * 2;
  const height = sheet.measureStack(lines, inner) + CARD_PAD * 2;

  sheet.section('Stay');
  sheet.ensure(height);
  sheet.box(sheet.left, sheet.y, sheet.width, height, { fill: COLOR.primarySoft, radius: 8 });
  sheet.drawStack(lines, sheet.left + CARD_PAD, sheet.y + CARD_PAD, inner);
  sheet.y += height;
}

function drawNotes(sheet: Sheet, notes: readonly string[]): void {
  sheet.section('Notes');
  for (const note of notes) {
    sheet.ensure(16);
    sheet.doc.setFillColor(COLOR.accent[0], COLOR.accent[1], COLOR.accent[2]);
    sheet.doc.circle(sheet.left + 4, sheet.y + 6.4, 1.9, 'F');
    sheet.y += sheet.drawText(note, body, sheet.left + 14, sheet.y, sheet.width - 14) + 4;
  }
}

function drawRoute(sheet: Sheet, stops: readonly RouteStop[]): void {
  const path = stops.map((s) => (s.isStay ? s.name : `${s.label}. ${s.name}`)).join('  >  ');
  sheet.section('Day route');
  sheet.write(path, meta);
}

/** Renders one day onto the current page. Assumes the cursor is at the top. */
export function drawDayPage(sheet: Sheet, draft: Draft, index: number, hero: PdfImage | null): void {
  const day = draft.days[index];
  if (!day) return;

  const stay = draft.stays.find((s) => s.key.trim() && s.key.trim() === day.stayId.trim()) ?? null;
  const blocks = day.items.filter((i) => i.title.trim() || i.description.trim());
  const notes = day.notes.filter((n) => n.trim());
  const route = buildRoute(day, stay);

  drawBand(sheet, draft, index);
  if (hero) drawHero(sheet, hero);
  drawHeading(sheet, day);

  if (blocks.length > 0) {
    sheet.section('Schedule');
    for (const block of blocks) drawBlock(sheet, block);
    sheet.y -= BLOCK_GAP;
  } else {
    sheet.write('Nothing scheduled. Enjoy the day.', { size: 10, color: COLOR.faint }, 14);
  }

  if (stay) drawStay(sheet, stay);
  if (notes.length > 0) drawNotes(sheet, notes);
  if (route.length > 1) drawRoute(sheet, route);
}
