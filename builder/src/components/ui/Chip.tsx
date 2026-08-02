'use client';

import type { ButtonHTMLAttributes } from 'react';
import { CONTROL_TEXT, FOCUS_RING, cx, type ControlSize } from '@/components/ui/tokens';

export type ChipTone = 'primary' | 'ink';

interface ChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  readonly active?: boolean;
  readonly size?: ControlSize;
  readonly tone?: ChipTone;
}

const ACTIVE: Record<ChipTone, string> = {
  primary: 'border-primary bg-primary text-white',
  ink: 'border-ink bg-ink text-white',
};

const IDLE: Record<ChipTone, string> = {
  primary: 'border-line bg-white text-muted hover:border-primary hover:text-primary',
  ink: 'border-line bg-white text-muted hover:border-ink hover:text-ink',
};

const PAD: Record<ControlSize, string> = {
  xs: 'h-7 px-2.5',
  sm: 'h-8 px-3',
  md: 'h-9 px-3.5',
};

/** Pill-shaped toggle used for tabs and single-value pickers. */
export default function Chip({
  active = false,
  size = 'sm',
  tone = 'primary',
  className,
  ...rest
}: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cx(
        'inline-flex select-none items-center justify-center rounded-full border font-bold transition',
        FOCUS_RING,
        PAD[size],
        CONTROL_TEXT[size],
        active ? ACTIVE[tone] : IDLE[tone],
        className
      )}
      {...rest}
    />
  );
}
