'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GitFork, Loader2 } from 'lucide-react';
import { useUser } from '@/lib/contexts/UserContext';

interface RemixButtonProps {
  animationId: string;
  /** Path to redirect unauthenticated users back to after login. Defaults to current path. */
  redirectOnUnauth?: string;
  className?: string;
}

export function RemixButton({ animationId, redirectOnUnauth, className }: RemixButtonProps) {
  const router = useRouter();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user) {
      const redirect = redirectOnUnauth ?? (typeof window !== 'undefined' ? window.location.pathname : '/gallery');
      router.push(`/login?redirect=${encodeURIComponent(redirect)}`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/animations/${animationId}/remix`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          setError(data.error?.message || 'You have reached your animation limit. Delete some animations to remix more.');
        } else {
          setError(data.error?.message || 'Failed to create remix. Please try again.');
        }
        return;
      }

      router.push(`/app?load=${data.id}`);
    } catch (err) {
      console.error('[RemixButton] Error:', err);
      setError('Failed to create remix. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="contents">
      {error && (
        <p className="text-xs text-red-600 mt-1 mb-1">{error}</p>
      )}
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={className ?? 'w-full flex items-center justify-center gap-2 py-2 bg-surface-warm hover:bg-primary/10 border border-border hover:border-primary disabled:opacity-50 text-text-primary text-sm font-medium transition-colors'}
        title={user ? 'Remix this animation' : 'Log in to remix'}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <GitFork className="w-4 h-4" />
        )}
        {isLoading ? 'Creating...' : (user ? 'Remix' : 'Log in to remix')}
      </button>
    </div>
  );
}
