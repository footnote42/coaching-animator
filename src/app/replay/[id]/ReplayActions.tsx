'use client';

import Link from 'next/link';
import { RemixButton } from '@/shared/ui/RemixButton';
import { RemixChain } from '@/shared/ui/RemixChain';

interface ReplayActionsProps {
  animationId: string;
  remixedFromId?: string | null;
  remixedFromTitle?: string | null;
}

export function ReplayActions({ animationId, remixedFromId, remixedFromTitle }: ReplayActionsProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      {/* Phase 2: Remix genealogy chain (≥3 generations) */}
      <RemixChain animationId={animationId} />

      {/* Fallback single-level attribution when no deep chain */}
      {remixedFromTitle && (
        <p className="text-sm text-text-primary/60">
          Remixed from{' '}
          {remixedFromId ? (
            <Link href={`/replay/${remixedFromId}`} className="text-primary hover:underline">
              {remixedFromTitle}
            </Link>
          ) : (
            <span>{remixedFromTitle}</span>
          )}
        </p>
      )}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <RemixButton
          animationId={animationId}
          redirectOnUnauth={`/replay/${animationId}`}
          className="inline-flex items-center gap-2 px-4 py-2 border border-border bg-surface hover:border-primary hover:bg-primary/10 disabled:opacity-50 text-text-primary font-medium transition-colors"
        />
        <a
          href="/app"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-text-inverse font-medium hover:bg-primary/90 transition-colors"
        >
          Create Your Own Animation
        </a>
      </div>
    </div>
  );
}
