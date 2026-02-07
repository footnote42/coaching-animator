'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Clock, Layers, EyeOff, Link, Globe, Pencil, Trash2, Play, Copy, Check } from 'lucide-react';
import { AnimationType, Visibility } from '@/lib/schemas/animations';

export interface AnimationSummary {
  id: string;
  title: string;
  description?: string | null;
  animation_type: AnimationType;
  duration_ms: number;
  frame_count: number;
  visibility: Visibility;
  upvote_count: number;
  created_at: string;
  updated_at: string;
  thumbnail_url?: string | null;
}

interface AnimationCardProps {
  animation: AnimationSummary;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onPlay?: (id: string) => void;
  showActions?: boolean;
  showCopyLink?: boolean;
}

const ANIMATION_TYPE_LABELS: Record<AnimationType, string> = {
  tactic: 'Tactic',
  skill: 'Skill',
  game: 'Game',
  other: 'Other',
};

const VISIBILITY_ICONS: Record<Visibility, React.ReactNode> = {
  private: <EyeOff className="w-3.5 h-3.5" />,
  link_shared: <Link className="w-3.5 h-3.5" />,
  public: <Globe className="w-3.5 h-3.5" />,
};

const VISIBILITY_LABELS: Record<Visibility, string> = {
  private: 'Private',
  link_shared: 'Link Only',
  public: 'Public',
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

export function AnimationCard({
  animation,
  onEdit,
  onDelete,
  onPlay,
  showActions = true,
  showCopyLink = true,
}: AnimationCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);

  const canCopyLink = animation.visibility !== 'private';

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/replay/${animation.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div
      className="border border-border bg-surface hover:border-primary transition-colors"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail with play overlay */}
      <div
        className="relative aspect-[4/3] bg-surface-warm flex items-center justify-center cursor-pointer group"
        onClick={() => onPlay?.(animation.id)}
      >
        {animation.thumbnail_url ? (
          <Image
            src={animation.thumbnail_url}
            alt={animation.title}
            fill
            className="object-cover"
            unoptimized // External dynamic URL from Supabase
            onError={(e) => {
              // Fallback to placeholder on image error
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement?.querySelector('.fallback-placeholder')?.classList.remove('hidden');
            }}
          />
        ) : null}

        {/* Fallback placeholder (shown when no thumbnail or image fails to load) */}
        <div className={`${animation.thumbnail_url ? 'hidden' : ''} fallback-placeholder text-text-primary/30 text-sm font-mono`}>
          {animation.frame_count} frames
        </div>

        {/* Play overlay */}
        <div className={`absolute inset-0 bg-primary/80 flex items-center justify-center transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <Play className="w-12 h-12 text-text-inverse fill-current" />
        </div>

        {/* Visibility badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-surface/90 text-xs font-medium">
          {VISIBILITY_ICONS[animation.visibility]}
          <span>{VISIBILITY_LABELS[animation.visibility]}</span>
        </div>
      </div>

      {/* Card content */}
      <div className="p-3">
        <h3 className="font-heading font-semibold text-text-primary truncate mb-1">
          {animation.title}
        </h3>

        <div className="flex items-center gap-3 text-xs text-text-primary/70 mb-2">
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formatDuration(animation.duration_ms)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            {animation.frame_count}
          </span>
          <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-medium uppercase">
            {ANIMATION_TYPE_LABELS[animation.animation_type]}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-text-primary/50">
          <span>{formatDate(animation.created_at)}</span>

          <div className="flex items-center gap-1">
            {showCopyLink && canCopyLink && (
              <button
                onClick={handleCopyLink}
                className={`p-1.5 transition-colors ${copied ? 'text-green-600' : 'hover:bg-surface-warm'}`}
                title={copied ? 'Copied!' : 'Copy Link'}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            )}
            {showActions && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(animation.id);
                  }}
                  className="p-1.5 hover:bg-surface-warm transition-colors"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(animation.id);
                  }}
                  className="p-1.5 hover:bg-red-50 text-red-600 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
