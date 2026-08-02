'use client';

import { useEffect, type ReactNode } from 'react';
import Portal from '@/components/ui/Portal';
import { IconButton } from '@/components/ui/Button';

interface Props {
  readonly title: string;
  readonly subtitle?: string;
  readonly onClose: () => void;
  readonly children: ReactNode;
  readonly footer?: ReactNode;
  readonly width?: 'md' | 'lg';
}

export default function Modal({ title, subtitle, onClose, children, footer, width = 'lg' }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <Portal>
      <div
        className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/40 p-4"
        onClick={onClose}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          onClick={(e) => e.stopPropagation()}
          className={`flex max-h-[88vh] w-full flex-col rounded-lg bg-white p-5 shadow-2xl ${
            width === 'lg' ? 'max-w-2xl' : 'max-w-md'
          }`}
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-ink">{title}</h2>
              {subtitle ? <p className="text-sm text-muted">{subtitle}</p> : null}
            </div>
            <IconButton label="Close" onClick={onClose}>
              {'\u{2715}'}
            </IconButton>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>

          {footer ? <div className="mt-5 flex justify-end gap-2">{footer}</div> : null}
        </div>
      </div>
    </Portal>
  );
}
