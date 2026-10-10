import { DESIGN_TOKENS } from '@/shared/design-tokens';

/** Share view skeleton: full-screen like the viewer, a header bar, a pitch-green canvas block and control stubs. */
export default function PracticeShareLoading() {
  return (
    <div
      aria-busy="true"
      style={{ position: 'fixed', inset: 0 }}
      className="z-50 flex flex-col overflow-hidden bg-background"
    >
      <span className="sr-only" role="status">Loading Practice</span>
      <div aria-hidden="true" className="flex min-h-12 items-center gap-2 border-b border-border/30 px-3 py-1.5">
        <div className="h-5 w-40 animate-pulse bg-[var(--color-border)] opacity-20 motion-reduce:animate-none" />
      </div>
      <div aria-hidden="true" className="flex min-h-0 flex-1 p-2">
        <div
          className="w-full animate-pulse opacity-80 motion-reduce:animate-none"
          style={{ backgroundColor: DESIGN_TOKENS.colours.primary }}
        />
      </div>
      <div aria-hidden="true" className="flex h-16 items-center justify-center gap-2 border-t border-border/30">
        <div className="h-11 w-11 animate-pulse bg-[var(--color-border)] opacity-20 motion-reduce:animate-none" />
        <div className="h-11 w-24 animate-pulse bg-[var(--color-border)] opacity-20 motion-reduce:animate-none" />
        <div className="h-11 w-11 animate-pulse bg-[var(--color-border)] opacity-20 motion-reduce:animate-none" />
      </div>
    </div>
  );
}
