'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { CONE_OUTLINE, markerColour } from '@/features/practice/markerColour';
import { CONE_COLOURS, type ConeColour } from '@/features/practice/schema';
import { cn } from '@/lib/utils';

/** Swatches per row: narrow enough to fit beside the toolbar on a phone. */
const COLUMNS = 3;

const colourName = (colour: ConeColour) => `${colour[0].toUpperCase()}${colour.slice(1)}`;

/**
 * The Cone palette button. Its face arms cone placement in the current colour;
 * its arrow opens a swatch popover, where choosing a colour sets it and arms placement.
 */
export function ConeSplitButton({
  active,
  colour,
  onPlace,
  onPickColour,
  className,
  onPreview,
}: {
  /** Whether the cone tool is armed. */
  active: boolean;
  /** The current cone colour, remembered for the session. */
  colour: ConeColour;
  onPlace: () => void;
  onPickColour: (colour: ConeColour) => void;
  className?: string;
  onPreview?: (preview: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLButtonElement>(null);
  const swatchRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const popoverId = useId();
  const name = `Place ${colourName(colour).toLowerCase()} cone`;

  // Focus the current colour when the popover opens.
  useEffect(() => {
    if (open) swatchRefs.current[CONE_COLOURS.indexOf(colour)]?.focus();
    // Only on opening: moving between swatches must not steal focus back.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Close on a press, or on focus (Tab), anywhere outside.
  useEffect(() => {
    if (!open) return;
    const onOutside = (e: Event) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onOutside);
    document.addEventListener('focusin', onOutside);
    return () => {
      document.removeEventListener('pointerdown', onOutside);
      document.removeEventListener('focusin', onOutside);
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    arrowRef.current?.focus();
  };

  const choose = (next: ConeColour) => {
    onPickColour(next);
    close();
  };

  const onPopoverKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const index = swatchRefs.current.findIndex((el) => el === document.activeElement);
    const step = ({ ArrowRight: 1, ArrowLeft: -1, ArrowDown: COLUMNS, ArrowUp: -COLUMNS } as Record<string, number>)[e.key];
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (step !== undefined) {
      e.preventDefault();
      const next = (index + step + CONE_COLOURS.length) % CONE_COLOURS.length;
      swatchRefs.current[next]?.focus();
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      swatchRefs.current[e.key === 'Home' ? 0 : CONE_COLOURS.length - 1]?.focus();
    }
  };

  return (
    <div
      ref={rootRef}
      className="relative flex"
      onPointerEnter={() => onPreview?.(true)}
      onPointerLeave={() => onPreview?.(false)}
      onFocusCapture={() => onPreview?.(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) onPreview?.(false);
      }}
    >
      <Button
        variant={active ? 'default' : 'outline'}
        className={cn(className, 'border-r-0')}
        aria-label={name}
        aria-pressed={active}
        title={name}
        onClick={() => {
          setOpen(false);
          onPlace();
        }}
      >
        <span
          aria-hidden
          className="inline-block h-4 w-4 border"
          style={{ backgroundColor: markerColour({ kind: 'cone', colour }), borderColor: CONE_OUTLINE }}
        />
        <span className="hidden 2xl:inline">Cone</span>
      </Button>
      <Button
        ref={arrowRef}
        variant={active ? 'default' : 'outline'}
        className="h-11 w-11 min-w-11 px-0"
        aria-label="Cone colour"
        title="Cone colour"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' && !open) {
            e.preventDefault();
            setOpen(true);
          }
        }}
      >
        <ChevronDown aria-hidden className={cn('transition-transform motion-reduce:transition-none', open && 'rotate-180')} />
      </Button>
      {open && (
        <div
          id={popoverId}
          role="dialog"
          aria-label="Cone colour"
          onKeyDown={onPopoverKeyDown}
          className="absolute left-0 top-full z-20 mt-1 grid w-max grid-cols-3 gap-1 border border-[var(--color-border)] bg-[var(--color-surface)] p-1 shadow-md"
        >
          {CONE_COLOURS.map((option, i) => {
            const current = option === colour;
            return (
              <button
                key={option}
                ref={(el) => {
                  swatchRefs.current[i] = el;
                }}
                type="button"
                aria-label={`${colourName(option)} cone`}
                title={`${colourName(option)} cone`}
                aria-pressed={current}
                onClick={() => choose(option)}
                className="flex h-11 w-11 items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span
                  aria-hidden
                  className={cn('inline-block h-6 w-6 rounded-full border-2', current && 'ring-2 ring-black ring-offset-1')}
                  style={{ backgroundColor: markerColour({ kind: 'cone', colour: option }), borderColor: CONE_OUTLINE }}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
