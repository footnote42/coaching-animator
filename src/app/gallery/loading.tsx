import { DESIGN_TOKENS } from '@/shared/design-tokens';

/** Gallery skeleton: heading, search row and a card grid shaped like the real cards. */
export default function GalleryLoading() {
  return (
    <main aria-busy="true" className="mx-auto w-full max-w-6xl px-4 py-6">
      <span className="sr-only" role="status">Loading Gallery</span>
      <h1 className="mb-4 text-4xl text-text-primary" aria-hidden="true">Gallery</h1>
      <div aria-hidden="true" className="mb-6 flex gap-2">
        <div className="min-h-[44px] flex-1 animate-pulse border-2 border-[var(--color-border)] bg-[var(--color-surface)] motion-reduce:animate-none" />
        <div className="min-h-[44px] w-24 animate-pulse bg-[var(--color-border)] opacity-20 motion-reduce:animate-none" />
      </div>
      <ul aria-hidden="true" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <li key={i} className="border-2 border-[var(--color-border)] bg-[var(--color-surface)]">
            <div
              className="aspect-[4/3] w-full animate-pulse opacity-80 motion-reduce:animate-none"
              style={{ backgroundColor: DESIGN_TOKENS.colours.primary }}
            />
            <div className="space-y-2 p-3">
              <div className="h-5 w-3/4 animate-pulse bg-[var(--color-border)] opacity-20 motion-reduce:animate-none" />
              <div className="h-3 w-1/2 animate-pulse bg-[var(--color-border)] opacity-20 motion-reduce:animate-none" />
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
