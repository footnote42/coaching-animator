'use client';

import { useState } from 'react';
import { Clock, Layers, ThumbsUp, Play, User } from 'lucide-react';
import { AnimationType } from '@/lib/schemas/animations';

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
}

interface PublicAnimationCardProps {
  animation: PublicAnimation;
  onView: (id: string) => void;
  currentUserId?: string | null;
  onUpvote?: (id: string) => Promise<{ upvoted: boolean; upvote_count: number } | null>;
  onLoginRequired?: () => void;
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

export function PublicAnimationCard({ animation, onView, currentUserId, onUpvote, onLoginRequired }: PublicAnimationCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [hasUpvoted, setHasUpvoted] = useState(animation.user_has_upvoted);
  const [upvoteCount, setUpvoteCount] = useState(animation.upvote_count);
  const [isUpvoting, setIsUpvoting] = useState(false);

  const isOwner = currentUserId && animation.user_id === currentUserId;

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

  return (
    <div
      className="border border-border bg-surface hover:border-primary transition-colors cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onView(animation.id)}
    >
      {/* Thumbnail with play overlay */}
      <div className="relative aspect-[4/3] bg-surface-warm flex items-center justify-center">
        {animation.thumbnail_url ? (
          <img
            src={animation.thumbnail_url}
            alt={animation.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to placeholder on image error
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        
        {/* Fallback placeholder (shown when no thumbnail or image fails to load) */}
        <div className={`${animation.thumbnail_url ? 'hidden' : ''} text-text-primary/30 text-sm font-mono`}>
          {animation.frame_count} frames
        </div>
        
        {/* Play overlay */}
        <div className={`absolute inset-0 bg-primary/80 flex items-center justify-center transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <Play className="w-12 h-12 text-text-inverse fill-current" />
        </div>

        {/* Type badge */}
        <div className="absolute top-2 left-2 px-2 py-1 bg-primary/90 text-text-inverse text-xs font-medium uppercase">
          {ANIMATION_TYPE_LABELS[animation.animation_type]}
        </div>

        {/* Upvote button */}
        {!isOwner && (
          <button
            onClick={handleUpvoteClick}
            disabled={isUpvoting}
            className={`absolute top-2 right-2 flex items-center gap-1 px-2 py-1 text-xs font-medium transition-colors ${
              hasUpvoted
                ? 'bg-primary text-text-inverse'
                : 'bg-surface/90 hover:bg-surface'
            }`}
            title={currentUserId ? (hasUpvoted ? 'Remove upvote' : 'Upvote') : 'Sign in to upvote'}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? 'fill-current' : ''}`} />
            <span>{upvoteCount}</span>
          </button>
        )}
        {isOwner && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-surface/90 text-xs font-medium">
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

        <div className="flex items-center justify-between text-xs text-text-primary/50">
          <span className="flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            {animation.author.display_name || 'Anonymous'}
          </span>
          <span>{formatDate(animation.created_at)}</span>
        </div>
      </div>
    </div>
  );
}
