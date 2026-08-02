/** One source of truth for every interactive control in the builder.
 *  Inputs, dropdowns and buttons all share these heights, radii and rings so
 *  nothing looks like a browser default. */

export type ControlSize = 'xs' | 'sm' | 'md';
export type ButtonVariant = 'primary' | 'ghost' | 'danger' | 'subtle' | 'inverse' | 'accent';

/** Heights are fixed so a button placed next to an input lines up exactly. */
export const CONTROL_HEIGHT: Record<ControlSize, string> = {
  xs: 'h-7',
  sm: 'h-8',
  md: 'h-9',
};

export const CONTROL_TEXT: Record<ControlSize, string> = {
  xs: 'text-[11px]',
  sm: 'text-xs',
  md: 'text-sm',
};

export const CONTROL_PAD: Record<ControlSize, string> = {
  xs: 'px-2 gap-1',
  sm: 'px-2.5 gap-1.5',
  md: 'px-3 gap-1.5',
};

export const CONTROL_SQUARE: Record<ControlSize, string> = {
  xs: 'w-7',
  sm: 'w-8',
  md: 'w-9',
};

export const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:border-primary';

export const CONTROL_BASE =
  `inline-flex select-none items-center justify-center rounded-sm border font-semibold ` +
  `whitespace-nowrap transition ${FOCUS_RING} ` +
  `disabled:cursor-not-allowed disabled:opacity-40`;

export const BUTTON_VARIANT: Record<ButtonVariant, string> = {
  primary: 'border-primary bg-primary text-white hover:bg-primaryDark hover:border-primaryDark',
  ghost: 'border-line bg-white text-primary hover:border-primary hover:bg-primarySoft',
  danger: 'border-transparent bg-dangerSoft text-danger hover:bg-danger hover:text-white',
  subtle: 'border-transparent bg-transparent text-muted hover:bg-sunken hover:text-primary',
  inverse: 'border-transparent bg-white/15 text-white hover:bg-white/25',
  accent: 'border-accent bg-accent text-white hover:brightness-110',
};

export function controlClasses(size: ControlSize): string {
  return `${CONTROL_HEIGHT[size]} ${CONTROL_TEXT[size]} ${CONTROL_PAD[size]}`;
}

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}
