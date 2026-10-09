'use client';

import { useId, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditorSectionProps {
  title: string;
  /** Short extra text after the title, such as a count. */
  meta?: ReactNode;
  /**
   * 'phone': folds on a phone only and is always open from md up (SSR-safe: pure CSS).
   * 'always': folds at every width.
   */
  collapse?: 'phone' | 'always';
  /** Show the title from md up. Off when the content carries its own legend. */
  showTitle?: boolean;
  /** Controlled open state; uncontrolled (closed) when left out. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  children: ReactNode;
}

/**
 * A headed group of editor controls. On a phone each group folds so the canvas
 * stays near the top of the page; on a desktop the column shows them all.
 */
export function EditorSection({
  title,
  meta,
  collapse = 'phone',
  showTitle = true,
  open,
  onOpenChange,
  className,
  children,
}: EditorSectionProps) {
  const [ownOpen, setOwnOpen] = useState(false);
  const isOpen = open ?? ownOpen;
  const setOpen = onOpenChange ?? setOwnOpen;
  const panelId = useId();
  const phoneOnly = collapse === 'phone';

  return (
    <section className={cn('flex flex-col border-t border-[var(--color-border)] pt-1', className)}>
      <h2 className={cn('text-sm font-medium text-text-primary', phoneOnly && !showTitle && 'md:hidden')}>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => setOpen(!isOpen)}
          className={cn(
            'flex min-h-11 w-full items-center justify-between gap-2 text-left font-heading font-extrabold uppercase focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
            phoneOnly && 'md:hidden',
          )}
        >
          <span>
            {title}
            {meta && <span className="font-sans font-normal normal-case text-text-muted"> {meta}</span>}
          </span>
          <ChevronDown aria-hidden className={cn('h-4 w-4 shrink-0 transition-transform', isOpen && 'rotate-180')} />
        </button>
        {phoneOnly && showTitle && (
          <span className="hidden min-h-11 items-center md:flex">
            {title}
            {meta && <span className="font-sans font-normal normal-case text-text-muted">&nbsp;{meta}</span>}
          </span>
        )}
      </h2>
      <div id={panelId} className={cn('flex-col gap-3 pb-3', isOpen ? 'flex' : 'hidden', phoneOnly && 'md:flex')}>
        {children}
      </div>
    </section>
  );
}
