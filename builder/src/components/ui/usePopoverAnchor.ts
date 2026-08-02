'use client';

import { useEffect, useState, type RefObject } from 'react';

export interface AnchorBox {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly maxHeight: number;
  readonly placement: 'below' | 'above';
}

const GAP = 4;
const MARGIN = 8;
const PREFERRED = 260;

/** Measures a trigger in viewport coordinates so the menu can be rendered in a
 *  portal. Portals dodge the overflow clipping of the scrolling editor pane. */
export default function usePopoverAnchor(
  open: boolean,
  ref: RefObject<HTMLElement | null>
): AnchorBox | null {
  const [box, setBox] = useState<AnchorBox | null>(null);

  useEffect(() => {
    if (!open) {
      setBox(null);
      return;
    }

    const measure = () => {
      const el = ref.current;
      if (!el) return;

      const r = el.getBoundingClientRect();
      const below = window.innerHeight - r.bottom - MARGIN;
      const above = r.top - MARGIN;
      const openUp = below < Math.min(PREFERRED, above);

      setBox({
        left: r.left,
        top: openUp ? r.top - GAP : r.bottom + GAP,
        width: r.width,
        maxHeight: Math.max(120, Math.min(PREFERRED, openUp ? above : below)),
        placement: openUp ? 'above' : 'below',
      });
    };

    measure();
    window.addEventListener('scroll', measure, true);
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('scroll', measure, true);
      window.removeEventListener('resize', measure);
    };
  }, [open, ref]);

  return box;
}
