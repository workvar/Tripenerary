'use client';

import type { ButtonHTMLAttributes } from 'react';
import {
  BUTTON_VARIANT,
  CONTROL_BASE,
  CONTROL_HEIGHT,
  CONTROL_SQUARE,
  CONTROL_TEXT,
  controlClasses,
  cx,
  type ButtonVariant,
  type ControlSize,
} from '@/components/ui/tokens';

type NativeProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'>;

interface ButtonProps extends NativeProps {
  readonly variant?: ButtonVariant;
  readonly size?: ControlSize;
  readonly block?: boolean;
}

export default function Button({
  variant = 'ghost',
  size = 'md',
  block = false,
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cx(
        CONTROL_BASE,
        controlClasses(size),
        BUTTON_VARIANT[variant],
        block && 'w-full',
        className
      )}
      {...rest}
    />
  );
}

interface IconButtonProps extends NativeProps {
  readonly variant?: ButtonVariant;
  readonly size?: ControlSize;
  /** Required: icon-only buttons carry no text for screen readers. */
  readonly label: string;
}

export function IconButton({
  variant = 'ghost',
  size = 'sm',
  label,
  className,
  children,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cx(
        CONTROL_BASE,
        CONTROL_HEIGHT[size],
        CONTROL_SQUARE[size],
        CONTROL_TEXT[size],
        'shrink-0 p-0 font-normal',
        BUTTON_VARIANT[variant],
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
