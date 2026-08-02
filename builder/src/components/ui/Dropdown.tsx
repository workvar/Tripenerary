'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import Portal from '@/components/ui/Portal';
import usePopoverAnchor from '@/components/ui/usePopoverAnchor';
import {
  CONTROL_HEIGHT,
  CONTROL_PAD,
  CONTROL_TEXT,
  FIELD_SHELL,
  cx,
  type ControlSize,
} from '@/components/ui/fieldShell';

export interface DropdownOption<T extends string> {
  readonly value: T;
  readonly label: string;
  readonly hint?: string;
}

interface Props<T extends string> {
  readonly value: T;
  readonly onChange: (value: T) => void;
  readonly options: readonly DropdownOption<T>[];
  readonly size?: ControlSize;
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly id?: string;
  readonly className?: string;
}

/** A listbox built from divs. Deliberately not a native <select> so the closed
 *  state, the open menu and the buttons beside it all share one look. */
export default function Dropdown<T extends string>({
  value,
  onChange,
  options,
  size = 'md',
  placeholder = 'Select…',
  disabled = false,
  id,
  className,
}: Props<T>) {
  const generatedId = useId();
  const listId = id ?? generatedId;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const box = usePopoverAnchor(open, triggerRef);

  const selectedIndex = options.findIndex((o) => o.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  useEffect(() => {
    if (open) setActive(selectedIndex >= 0 ? selectedIndex : 0);
  }, [open, selectedIndex]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || listRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [open, active]);

  const commit = (index: number) => {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (disabled) return;

    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }

    if (e.key === 'Escape' || e.key === 'Tab') {
      setOpen(false);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(options.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActive(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActive(options.length - 1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      commit(active);
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={`${listId}-list`}
        aria-haspopup="listbox"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onKeyDown}
        className={cx(
          FIELD_SHELL,
          CONTROL_HEIGHT[size],
          CONTROL_TEXT[size],
          CONTROL_PAD[size],
          'flex items-center justify-between text-left font-normal',
          open && 'border-primary ring-2 ring-primary/15',
          className
        )}
      >
        <span className={cx('truncate', !selected && 'text-faint')}>
          {selected?.label ?? placeholder}
        </span>
        <span
          aria-hidden
          className={cx('ml-2 shrink-0 text-[9px] text-muted transition-transform', open && 'rotate-180')}
        >
          {'\u{25BC}'}
        </span>
      </button>

      {open && box ? (
        <Portal>
          <div
            ref={listRef}
            id={`${listId}-list`}
            role="listbox"
            style={{
              position: 'fixed',
              left: box.left,
              top: box.placement === 'below' ? box.top : undefined,
              bottom: box.placement === 'above' ? window.innerHeight - box.top : undefined,
              width: box.width,
              maxHeight: box.maxHeight,
              zIndex: 80,
            }}
            className="overflow-y-auto rounded-sm border border-line bg-white p-1 shadow-xl"
          >
            {options.length === 0 ? (
              <p className="px-2.5 py-2 text-xs text-faint">Nothing to pick yet.</p>
            ) : null}

            {options.map((option, i) => {
              const isSelected = option.value === value;
              return (
                <div
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  data-active={i === active}
                  onPointerEnter={() => setActive(i)}
                  onClick={() => commit(i)}
                  className={cx(
                    'cursor-pointer rounded-xs px-2.5 py-1.5 text-sm transition',
                    i === active ? 'bg-primarySoft text-primary' : 'text-ink',
                    isSelected && 'font-semibold'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className="flex-1 truncate">{option.label}</span>
                    {isSelected ? <span aria-hidden className="text-primary">{'\u{2713}'}</span> : null}
                  </span>
                  {option.hint ? (
                    <span className="mt-0.5 block text-[11px] text-muted">{option.hint}</span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </Portal>
      ) : null}
    </>
  );
}
