'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/button';
import { useShareAnimation } from '@/core/hooks/useShareAnimation';
import { useProjectStore } from '@/core/stores/projectStore';
import { useUser } from '@/lib/contexts/UserContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/dialog';
import { Share2, WifiOff, Check, Copy } from 'lucide-react';
import { toast } from 'sonner';

export function ShareButton() {
  const project = useProjectStore((state) => state.project);
  const { shareAnimation, isSharing, error } = useShareAnimation();
  const { isAuthenticated } = useUser();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [modalOpen, setModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleShare = async () => {
    if (!project) return;

    // Auth guard — FR-009 / SC-001
    if (!isAuthenticated) {
      toast.info('Sign in to share this animation with your players.', {
        action: {
          label: 'Sign in',
          onClick: () => { window.location.href = '/auth/signin'; },
        },
        duration: 5000,
      });
      return;
    }

    const url = await shareAnimation(project);
    if (!url) {
      if (error) {
        toast.error(error, { duration: 4000 });
      }
      return;
    }

    // Try native Web Share API first (mobile)
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ url, title: project.name });
        return; // share succeeded — no modal needed
      } catch (err) {
        // AbortError = user dismissed — fall through to modal
        if (err instanceof Error && err.name !== 'AbortError') {
          // Unexpected share error — still show modal
        }
      }
    }

    // Desktop / fallback: show modal with URL
    setShareUrl(url);
    setModalOpen(true);
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link. Please copy it manually.');
    }
  };

  return (
    <>
      <Button
        onClick={handleShare}
        disabled={!project || !isOnline || isSharing}
        variant="secondary"
        className="w-full gap-2"
        id="share-animation-button"
      >
        {!isOnline ? (
          <>
            <WifiOff className="h-4 w-4" />
            Offline
          </>
        ) : isSharing ? (
          <>Sharing...</>
        ) : (
          <>
            <Share2 className="h-4 w-4" />
            Share Link
          </>
        )}
      </Button>

      {/* Share link modal — shown on desktop or when Web Share API fails */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="rounded-none max-w-md" id="share-link-dialog">
          <DialogHeader>
            <DialogTitle>Share Link</DialogTitle>
            <DialogDescription>
              Send this link to your players — they can watch the animation on
              their phone, no account needed.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-2 mt-2">
            <input
              readOnly
              value={shareUrl ?? ''}
              className="flex-1 border border-border bg-surface px-3 py-2 text-sm font-mono rounded-none focus:outline-none"
              id="share-url-input"
              onFocus={(e) => e.target.select()}
              aria-label="Share link URL"
            />
            <Button
              variant="secondary"
              className="gap-2 rounded-none shrink-0"
              onClick={handleCopy}
              id="copy-share-link-button"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
          </div>

          <div className="flex justify-end mt-2">
            <Button
              variant="ghost"
              onClick={() => setModalOpen(false)}
              id="dismiss-share-dialog-button"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
