/** Colours and page metrics for the printable day pages.
 *  Mirrors tailwind.config.ts so a PDF looks like the phone preview. */

export type Rgb = readonly [number, number, number];

export const COLOR = {
  ink: [27, 29, 28],
  muted: [107, 117, 115],
  faint: [154, 163, 161],
  primary: [14, 79, 76],
  primaryDark: [9, 55, 53],
  primarySoft: [230, 238, 237],
  accent: [217, 113, 60],
  accentSoft: [251, 237, 229],
  line: [227, 223, 214],
  lineSoft: [237, 234, 227],
  sunken: [241, 238, 231],
  white: [255, 255, 255],
} as const satisfies Record<string, Rgb>;

/** A4 portrait in points. */
export const PAGE = {
  width: 595.28,
  height: 841.89,
  margin: 44,
  /** Reserved strip at the bottom for the running footer. */
  footer: 34,
} as const;

/** Left gutter that holds the time of each schedule block. */
export const GUTTER = 62;

export const contentWidth = PAGE.width - PAGE.margin * 2;
export const contentBottom = PAGE.height - PAGE.margin - PAGE.footer;
