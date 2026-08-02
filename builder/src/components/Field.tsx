'use client';

import type { ChangeEvent, ReactNode } from 'react';

interface BaseProps {
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
  readonly className?: string;
}

export function Text({ label, value, onChange, placeholder, className = '' }: BaseProps) {
  return (
    <label className={`block ${className}`}>
      <span className="label">{label}</span>
      <input
        className="field"
        value={value}
        placeholder={placeholder}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      />
    </label>
  );
}

export function Area({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  className = '',
}: BaseProps & { readonly rows?: number }) {
  return (
    <label className={`block ${className}`}>
      <span className="label">{label}</span>
      <textarea
        className="field resize-y"
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
      />
    </label>
  );
}

export function Select<T extends string>({
  label,
  value,
  onChange,
  options,
  className = '',
}: {
  readonly label: string;
  readonly value: T;
  readonly onChange: (value: T) => void;
  readonly options: readonly { readonly value: T; readonly label: string }[];
  readonly className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="label">{label}</span>
      <select className="field" value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Grid2({ children }: { readonly children: ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>;
}

export function Grid3({ children }: { readonly children: ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-3">{children}</div>;
}
