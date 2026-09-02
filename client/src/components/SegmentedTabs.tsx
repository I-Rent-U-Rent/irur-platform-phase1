import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';

export interface SegmentedTab<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

interface Props<T extends string> {
  tabs: SegmentedTab<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  ariaLabel?: string;
}

/**
 * Pill-style tab switcher with a sliding highlight and arrow-key navigation.
 */
export default function SegmentedTabs<T extends string>({
  tabs,
  value,
  onChange,
  className = '',
  ariaLabel = 'Options',
}: Props<T>) {
  const buttons = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });

  const measure = useCallback(() => {
    const el = buttons.current.get(value);
    if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth, ready: true });
  }, [value]);

  useLayoutEffect(() => {
    measure();
  }, [measure, tabs.length]);

  useEffect(() => {
    window.addEventListener('resize', measure);
    // Web fonts can change button widths after first paint.
    const fonts = (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts;
    fonts?.ready.then(measure).catch(() => {});
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = tabs.findIndex((t) => t.value === value);
    if (i < 0) return;
    let nextIndex: number | null = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextIndex = (i + 1) % tabs.length;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') nextIndex = (i - 1 + tabs.length) % tabs.length;
    if (e.key === 'Home') nextIndex = 0;
    if (e.key === 'End') nextIndex = tabs.length - 1;
    if (nextIndex === null) return;
    e.preventDefault();
    const next = tabs[nextIndex];
    onChange(next.value);
    buttons.current.get(next.value)?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      className={`relative inline-flex p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800 border border-slate-300/60 dark:border-slate-700 ${className}`}
    >
      <span
        aria-hidden="true"
        className={`absolute top-1 bottom-1 rounded-lg bg-white dark:bg-slate-900 shadow-sm ring-1 ring-black/5 dark:ring-white/5 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          indicator.ready ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ left: indicator.left, width: indicator.width }}
      />
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            ref={(el) => {
              if (el) buttons.current.set(tab.value, el);
              else buttons.current.delete(tab.value);
            }}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(tab.value)}
            className={`relative z-10 inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors duration-300 ${
              active
                ? 'text-gold-600 dark:text-gold-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
