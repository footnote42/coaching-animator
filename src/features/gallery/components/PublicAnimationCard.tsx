'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, Layers, ThumbsUp, Play, User, Copy, Loader2, Share2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { AnimationType } from '@/lib/schemas/animations';
import { RemixButton } from '@/shared/ui/RemixButton';
import { MiniPitchSVG } from './MiniPitchSVG';
import { EndorsementBadge } from './EndorsementBadge';
import { ProgressionStrip } from './ProgressionStrip';

interface PublicAnimation {
  id: string;
  title: string;
  description: string | null;
  animation_type: AnimationType;
  tags: string[];
  duration_ms: number;
  frame_count: number;
  upvote_count: number;
  created_at: string;
  user_id?: string;
  author: {
    display_name: string | null;
  };
  user_has_upvoted: boolean;
  thumbnail_url?: string | null;
  // Phase 2: Progressions
  parent_animation_id?: string | null;
  is_progression?: boolean;
  progression_count?: number;
  // Phase 2: Remix genealogy
  remixed_from_id?: string | null;
  remixed_from_title?: string | null;
  remix_count?: number;
  // 009-gallery-playbook: visual previews + endorsement
  endorsed_by?: string | null;
  is_rfu_endorsed?: boolean;
  preview_entities?: Array<{ x: number; y: number; team: 'attack' | 'defense' | 'neutral' }> | null;
}

interface PublicAnimationCardProps {
  animation: PublicAnimation;
  onView: (id: string) => void;
  currentUserId?: string | null;
  onUpvote?: (id: string) => Promise<{ upvoted: boolean; upvote_count: number } | null>;
  onLoginRequired?: () => void;
  onRemix?: (id: string) => void; // V2.0: Clone/remix animation (templates)
  remixing?: boolean;
}

const ANIMATION_TYPE_LABELS: Record<AnimationType, string> = {
  tactic: 'Tactic',
  skill: 'Skill',
  game: 'Game',
  other: 'Other',
};

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function PublicAnimationCard({ animation, onView, currentUserId, onUpvote, onLoginRequired, onRemix, remixing }: PublicAnimationCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [hasUpvoted, setHasUpvoted] = useState(animation.user_has_upvoted);
  const [upvoteCount, setUpvoteCount] = useState(animation.upvote_count);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [copied, setCopied] = useState(false);

  const isOwner = currentUserId && animation.user_id === currentUserId;
  const isTemplate = animation.tags.includes('template'); // V2.0: Check if template
  const isRfuEndorsed = animation.is_rfu_endorsed || animation.endorsed_by === 'RFU';

  const handleUpvoteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!currentUserId) {
      onLoginRequired?.();
      return;
    }

    if (isOwner || !onUpvote) return;

    setIsUpvoting(true);
    try {
      const result = await onUpvote(animation.id);
      if (result) {
        setHasUpvoted(result.upvoted);
        setUpvoteCount(result.upvote_count);
      }
    } finally {
      setIsUpvoting(false);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/share/${animation.id}`;

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ url, title: animation.title });
        return;
      } catch {
        // AbortError or unsupported — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Link copied');
    } catch {
      // clipboard also failed — silent
    }
  };

  return (
    <div
      className="border border-border bg-surface hover:border-primary transition-colors cursor-pointer"
      data-testid="animation-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onView(animation.id)}
    >
      {/* Thumbnail / MiniPitchSVG preview area */}
      <div className="relative aspect-[4/3] bg-surface-warm flex items-center justify-center">
        {animation.thumbnail_url ? (
          <Image
            src={animation.thumbnail_url}
            alt={animation.title}
            fill
            className="object-cover"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement?.querySelector('.fallback-placeholder')?.classList.remove('hidden');
            }}
          />
        ) : null}

        {/* MiniPitchSVG fallback (T018) — replaces {n} frames text */}
        <div className={`${animation.thumbnail_url ? 'hidden' : ''} fallback-placeholder w-full h-full`}>
          <MiniPitchSVG
            entities={animation.preview_entities ?? null}
            className="w-full h-full"
          />
        </div>

        {/* Endorsement badge / RFU Badge (Top Right) */}
        {isRfuEndorsed ? (
          <div
            className="absolute top-2 right-2 w-10 h-10 shadow-sm bg-surface rounded-full overflow-hidden flex items-center justify-center z-10"
            title={`Endorsed by ${animation.endorsed_by || 'RFU'}. Endorsement does not guarantee accuracy, safety, or suitability for all coaching contexts. Coaches are responsible for adapting drills to their players' skill levels.`}
          >
            <Image
              src="/assets/rfu-badge.svg"
              alt="RFU Endorsed"
              width={40}
              height={40}
              unoptimized
            />
          </div>
        ) : animation.endorsed_by ? (
          <div
            className="absolute top-1 right-1 z-10"
            title={`Endorsed by ${animation.endorsed_by}. Endorsement does not guarantee accuracy, safety, or suitability for all coaching contexts. Coaches are responsible for adapting drills to their players' skill levels.`}
          >
            <EndorsementBadge endorsedBy={animation.endorsed_by} />
          </div>
        ) : null}

        {/* Play overlay */}
        <div className={`absolute inset-0 bg-primary/80 flex items-center justify-center transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <Play className="w-12 h-12 text-text-inverse fill-current" />
        </div>

        {/* Type badge */}
        <div className="absolute top-2 left-2 px-2 py-1 bg-primary/90 text-text-inverse text-xs font-medium uppercase">
          {ANIMATION_TYPE_LABELS[animation.animation_type]}
        </div>

        {/* V2.0: Template badge */}
        {isTemplate && (
          <div className="absolute top-11 left-2 px-2 py-1 bg-blue-600/90 text-white text-xs font-medium uppercase">
            Template
          </div>
        )}

        {/* Upvote button */}
        {!isOwner && (
          <button
            onClick={handleUpvoteClick}
            disabled={isUpvoting}
            className={`absolute top-2 ${animation.endorsed_by ? 'right-16' : 'right-2'} flex items-center gap-1 min-h-[44px] min-w-[44px] justify-center px-2 py-1 text-xs font-medium transition-colors ${hasUpvoted
              ? 'bg-primary text-text-inverse'
              : 'bg-surface/90 hover:bg-surface'
              }`}
            aria-label={currentUserId ? (hasUpvoted ? `Remove upvote (${upvoteCount})` : `Upvote (${upvoteCount})`) : "Sign in to upvote"}
            title={currentUserId ? (hasUpvoted ? 'Remove upvote' : 'Upvote') : 'Sign in to upvote'}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? 'fill-current' : ''}`} />
            <span>{upvoteCount}</span>
          </button>
        )}
        {isOwner && (
          <div className={`absolute top-2 ${animation.endorsed_by ? 'right-16' : 'right-2'} flex items-center gap-1 px-2 py-1 bg-surface/90 text-xs font-medium`}>
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>{upvoteCount}</span>
          </div>
        )}
      </div>

      {/* Card content */}
      <div className="p-3">
        <h3 className="font-heading font-semibold text-text-primary truncate mb-1">
          {animation.title}
        </h3>

        {/* Phase 2: Remix attribution */}
        {animation.remixed_from_title && (
          <p className="text-xs text-text-primary/50 truncate mb-1">
            Remixed from{' '}
            {animation.remixed_from_id ? (
              <Link
                href={`/share/${animation.remixed_from_id}`}
                onClick={(e) => e.stopPropagation()}
                className="text-text-primary/70 hover:text-primary hover:underline"
              >
                {animation.remixed_from_title}
              </Link>
            ) : (
              <span className="text-text-primary/70">{animation.remixed_from_title}</span>
            )}
          </p>
        )}

        {animation.description && (
          <p className="text-xs text-text-primary/70 line-clamp-2 mb-2">
            {animation.description}
          </p>
        )}

        <div className="flex items-center gap-3 text-xs text-text-primary/70 mb-2">
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formatDuration(animation.duration_ms)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            {animation.frame_count}
          </span>
          {(animation.progression_count ?? 0) > 0 && (
            <span className="inline-flex items-center px-1.5 py-0.5 bg-surface-warm border border-border text-[10px] font-medium text-primary ml-auto uppercase">
              {animation.progression_count} Progression{(animation.progression_count ?? 0) !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Tags */}
        {animation.tags && animation.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {animation.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-medium"
              >
                {tag}
              </span>
            ))}
            {animation.tags.length > 3 && (
              <span className="px-1.5 py-0.5 text-text-primary/50 text-[10px]">
                +{animation.tags.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-text-primary/50 mb-2">
          <span className="flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            {animation.author.display_name || 'Anonymous'}
          </span>
          <span>{formatDate(animation.created_at)}</span>
        </div>

        {/* V2.0: Use Template button */}
        {isTemplate && onRemix && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!remixing) onRemix(animation.id);
            }}
            disabled={remixing}
            className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium transition-colors"
          >
            {remixing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
            {remixing ? 'Creating...' : 'Use Template'}
          </button>
        )}

        {/* Phase 2: Remix button for non-template animations */}
        {!isTemplate && (
          <RemixButton animationId={animation.id} redirectOnUnauth="/gallery" />
        )}

        {/* Share action */}
        <button
          onClick={handleShare}
          className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2 border border-border hover:border-primary text-sm font-medium transition-colors mt-1"
          aria-label={copied ? 'Link copied' : 'Share animation'}
          id={`share-card-${animation.id}`}
        >
          {copied ? (
            <><Check className="w-4 h-4" /> Copied</>
          ) : (
            <><Share2 className="w-4 h-4" /> Share</>
          )}
        </button>
      </div>

      {/* Progression strip (T026) — always visible below card body when progressions exist */}
      <ProgressionStrip
        parentId={animation.id}
        progressionCount={animation.progression_count ?? 0}
      />
    </div>
  );
}
