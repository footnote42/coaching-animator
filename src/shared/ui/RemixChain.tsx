'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface LineageNode {
  id: string;
  title: string;
}

interface RemixChainProps {
  animationId: string;
}

/**
 * RemixChain — shows the remix genealogy breadcrumb for an animation.
 *
 * Fetches /api/animations/[id]/lineage and renders a horizontal chain:
 *   Original → Remix A → Remix B → Current
 *
 * Only shown when the chain has 2+ nodes (i.e. there is at least one ancestor).
 */
export function RemixChain({ animationId }: RemixChainProps) {
  const [chain, setChain] = useState<LineageNode[]>([]);

  useEffect(() => {
    fetch(`/api/animations/${animationId}/lineage`)
      .then((r) => r.json())
      .then((data: { chain: LineageNode[] }) => {
        if (data.chain && data.chain.length >= 2) {
          setChain(data.chain);
        }
      })
      .catch(() => {
        // Silently ignore — breadcrumb is decorative
      });
  }, [animationId]);

  if (chain.length < 2) return null;

  return (
    <div className="flex flex-wrap items-center gap-1 text-xs text-text-primary/60 mt-1">
      {chain.map((node, idx) => {
        const isLast = idx === chain.length - 1;
        return (
          <span key={node.id} className="inline-flex items-center gap-1">
            {isLast ? (
              <span className="text-text-primary/80 font-medium">{node.title}</span>
            ) : (
              <Link
                href={`/replay/${node.id}`}
                className="hover:text-primary hover:underline truncate max-w-[120px]"
                title={node.title}
              >
                {node.title}
              </Link>
            )}
            {!isLast && <ChevronRight className="w-3 h-3 flex-shrink-0" />}
          </span>
        );
      })}
    </div>
  );
}
