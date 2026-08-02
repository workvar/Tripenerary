'use client';

import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import {
  CONTROL_HEIGHT,
  CONTROL_PAD,
  CONTROL_TEXT,
  FIELD_SHELL,
  cx,
  type ControlSize,
} from '@/components/ui/fieldShell';

interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  readonly size?: ControlSize;
  readonly invalid?: boolean;
}

export default function TextInput({ size = 'md', invalid, className, ...rest }: TextInputProps) {
  return (
    <input
      className={cx(
        FIELD_SHELL,
        CONTROL_HEIGHT[size],
        CONTROL_TEXT[size],
        CONTROL_PAD[size],
        invalid && 'border-danger',
        className
      )}
      {...rest}
    />
  );
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  readonly invalid?: boolean;
}

export function TextArea({ rows = 3, invalid, className, ...rest }: TextAreaProps) {
  return (
    <textarea
      rows={rows}
      className={cx(
        FIELD_SHELL,
        'h-auto resize-y px-3 py-2 text-sm leading-relaxed',
        invalid && 'border-danger',
        className
      )}
      {...rest}
    />
  );
}
