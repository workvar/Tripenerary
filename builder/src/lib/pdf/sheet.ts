import type { jsPDF } from 'jspdf';
import { COLOR, PAGE, contentBottom, contentWidth, type Rgb } from '@/lib/pdf/theme';

export interface TextStyle {
  readonly size: number;
  readonly bold?: boolean;
  readonly color?: Rgb;
  /** Line height. Defaults to 1.35x the size. */
  readonly lead?: number;
  readonly align?: 'left' | 'right';
}

/** One measured line of a stack: text plus the space above it. */
export interface Line {
  readonly text: string;
  readonly style: TextStyle;
  readonly gap?: number;
}

/** The built-in fonts are Latin-1 only, so anything outside that range (emoji,
 *  Thai, CJK) is dropped rather than drawn as mojibake. */
export function sanitize(value: string): string {
  return value
    .replace(/\r/g, '')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/[→›]/g, '>')
    .replace(/[^\n\t\x20-\xFF]/g, '')
    .trim();
}

const lead = (style: TextStyle) => style.lead ?? style.size * 1.35;

/** Thin wrapper around jsPDF: a cursor, wrapped text, boxes and page breaks. */
export default class Sheet {
  y: number = PAGE.margin;

  constructor(readonly doc: jsPDF) {}

  get left(): number {
    return PAGE.margin;
  }

  get right(): number {
    return PAGE.width - PAGE.margin;
  }

  get width(): number {
    return contentWidth;
  }

  newPage(): void {
    this.doc.addPage();
    this.y = PAGE.margin;
  }

  /** Breaks to a new page when `height` will not fit under the cursor. */
  ensure(height: number): void {
    if (this.y + height > contentBottom) this.newPage();
  }

  private applyText(style: TextStyle): void {
    const [r, g, b] = style.color ?? COLOR.ink;
    this.doc.setFont('helvetica', style.bold ? 'bold' : 'normal');
    this.doc.setFontSize(style.size);
    this.doc.setTextColor(r, g, b);
  }

  wrap(text: string, style: TextStyle, width = this.width): string[] {
    const clean = sanitize(text);
    if (!clean) return [];
    this.applyText(style);
    return this.doc.splitTextToSize(clean, width) as string[];
  }

  /** Height a piece of text will take once wrapped, without drawing it. */
  measure(text: string, style: TextStyle, width = this.width): number {
    return this.wrap(text, style, width).length * lead(style);
  }

  /** Draws wrapped text at an absolute position. Returns the height used. */
  drawText(text: string, style: TextStyle, x: number, y: number, width = this.width): number {
    const lines = this.wrap(text, style, width);
    if (lines.length === 0) return 0;

    this.applyText(style);
    const step = lead(style);
    const anchor = style.align === 'right' ? x + width : x;

    lines.forEach((line, i) => {
      this.doc.text(line, anchor, y + step * (i + 0.78), { align: style.align ?? 'left' });
    });

    return lines.length * step;
  }

  /** Draws at the cursor and advances it. */
  write(text: string, style: TextStyle, gap = 0): number {
    const height = this.measure(text, style);
    if (height === 0) return 0;
    this.ensure(height + gap);
    this.y += gap;
    this.y += this.drawText(text, style, this.left, this.y);
    return height;
  }

  measureStack(lines: readonly Line[], width: number): number {
    return lines.reduce(
      (sum, line) => sum + (line.gap ?? 0) + this.measure(line.text, line.style, width),
      0
    );
  }

  drawStack(lines: readonly Line[], x: number, y: number, width: number): number {
    let cursor = y;
    for (const line of lines) {
      cursor += line.gap ?? 0;
      cursor += this.drawText(line.text, line.style, x, cursor, width);
    }
    return cursor - y;
  }

  box(
    x: number,
    y: number,
    width: number,
    height: number,
    opts: { readonly fill?: Rgb; readonly border?: Rgb; readonly radius?: number } = {}
  ): void {
    const { fill, border, radius = 8 } = opts;
    if (fill) this.doc.setFillColor(fill[0], fill[1], fill[2]);
    if (border) {
      this.doc.setDrawColor(border[0], border[1], border[2]);
      this.doc.setLineWidth(0.7);
    }
    const style = fill && border ? 'FD' : fill ? 'F' : 'S';
    this.doc.roundedRect(x, y, width, height, radius, radius, style);
  }

  /** Small pill with centred bold text. Returns its width. */
  chip(text: string, x: number, y: number, fill: Rgb, color: Rgb, size = 7.5): number {
    const clean = sanitize(text);
    if (!clean) return 0;
    this.applyText({ size, bold: true, color });
    const width = this.doc.getTextWidth(clean) + 12;
    this.box(x, y, width, size + 7, { fill, radius: (size + 7) / 2 });
    this.applyText({ size, bold: true, color });
    this.doc.text(clean, x + 6, y + size + 1.4);
    return width;
  }

  rule(y: number, color: Rgb = COLOR.lineSoft): void {
    this.doc.setDrawColor(color[0], color[1], color[2]);
    this.doc.setLineWidth(0.6);
    this.doc.line(this.left, y, this.right, y);
  }

  /** Accent section label, e.g. SCHEDULE. */
  section(label: string, gap = 18): void {
    this.write(label.toUpperCase(), { size: 8, bold: true, color: COLOR.accent, lead: 11 }, gap);
    this.y += 4;
  }

  /** Runs after every page exists, so "3 of 8" is correct. */
  footer(caption: string): void {
    const total = this.doc.getNumberOfPages();
    for (let page = 1; page <= total; page += 1) {
      this.doc.setPage(page);
      const y = PAGE.height - PAGE.margin + 6;
      this.rule(y - 12, COLOR.line);
      this.drawText(caption, { size: 7.5, color: COLOR.faint }, this.left, y - 8, this.width * 0.7);
      this.drawText(
        `${page} of ${total}`,
        { size: 7.5, color: COLOR.faint, align: 'right' },
        this.left,
        y - 8,
        this.width
      );
    }
  }
}
