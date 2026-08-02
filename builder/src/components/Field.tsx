'use client';

import { useId, type ChangeEvent, type ReactNode } from 'react';
import Dropdown, { type DropdownOption } from '@/components/ui/Dropdown';
import TextInput, { TextArea } from '@/components/ui/TextInput';
import { cx } from '@/components/ui/tokens';

interface BaseProps {
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
  readonly className?: string;
  /** Rendered on the right of the label row, e.g. an AI generate button. */
  readonly action?: ReactNode;
}

/** A div rather than a <label> wrapper: the row can hold its own button, and
 *  nesting a button inside a label is both odd for screen readers and clicky. */
function LabelRow({
  label,
  htmlFor,
  action,
}: {
  readonly label: string;
  readonly htmlFor?: string;
  readonly action?: ReactNode;
}) {
  return (
    <div className="mb-1 flex min-h-[28px] items-center justify-between gap-2">
      <label
        htmlFor={htmlFor}
        className="text-[11px] font-bold uppercase tracking-wider text-muted"
      >
        {label}
      </label>
      {action}
    </div>
  );
}

export function Text({ label, value, onChange, placeholder, className, action }: BaseProps) {
  const id = useId();
  return (
    <div className={cx('block', className)}>
      <LabelRow label={label} htmlFor={id} action={action} />
      <TextInput
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      />
    </div>
  );
}

export function Area({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  className,
  action,
}: BaseProps & { readonly rows?: number }) {
  const id = useId();
  return (
    <div className={cx('block', className)}>
      <LabelRow label={label} htmlFor={id} action={action} />
      <TextArea
        id={id}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
      />
    </div>
  );
}

export function Select<T extends string>({
  label,
  value,
  onChange,
  options,
  className,
  action,
}: {
  readonly label: string;
  readonly value: T;
  readonly onChange: (value: T) => void;
  readonly options: readonly DropdownOption<T>[];
  readonly className?: string;
  readonly action?: ReactNode;
}) {
  return (
    <div className={cx('block', className)}>
      <LabelRow label={label} action={action} />
      <Dropdown<T> value={value} onChange={onChange} options={options} />
    </div>
  );
}

export { type DropdownOption };

export function Grid2({ children }: { readonly children: ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>;
}

export function Grid3({ children }: { readonly children: ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-3">{children}</div>;
}
