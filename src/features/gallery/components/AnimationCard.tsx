'use client';

import { useState } from 'react';
import Image from 'next/image';
import NextLink from 'next/link';
import { Clock, Layers, EyeOff, Link, Globe, Pencil, Trash2, Play, History, Share2 } from 'lucide-react';
import { AnimationType, Visibility } from '@/lib/schemas/animations';
import { VersionHistoryModal } from './VersionHistoryModal';
import { MiniPitchSVG } from './MiniPitchSVG';
import { ProgressionStrip } from './ProgressionStrip';
import { ShareSheet } from '@/features/animation/components/ShareSheet';
import { cardActionHover } from '@/shared/ui/card-action-hover';

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
  current_version?: string; // V2.0: Current version number
  endorsed_by?: string | null;
  // Phase 2: Progressions
  parent_animation_id?: string | null;
  progression_order?: number;       // 0 = base, 1-5 = progression
  is_progression?: boolean;
  progression_count?: number;       // denormalized from DB
  // Phase 2: Remix genealogy
  remixed_from_id?: string | null;
  remixed_from_title?: string | null; // joined at API layer
  remix_count?: number;
  // 009-gallery-playbook: visual previews
  preview_entities?: Array<{ x: number; y: number; team: 'attack' | 'defense' | 'neutral' }> | null;
  // Endorsement
  is_rfu_endorsed?: boolean;
}

interface AnimationCardProps {
  animation: AnimationSummary;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onPlay?: (id: string) => void;
  showActions?: boolean;
  showCopyLink?: boolean;
  onRefresh?: () => void; // V2.0: Callback after version restore
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
  onRefresh,
}: AnimationCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false); // V2.0: Version history modal
  const [isShareOpen, setIsShareOpen] = useState(false);

  const canCopyLink = animation.visibility !== 'private';
  const isRfuEndorsed = animation.is_rfu_endorsed || animation.endorsed_by === 'RFU';

  return (
    <div
      className="border border-border bg-surface hover:border-primary transition-colors"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail with play overlay */}
      <div
        className="relative aspect-[4/3] bg-surface-warm flex items-center justify-center cursor-pointer group overflow-hidden"
        onClick={() => onPlay?.(animation.id)}
      >
        {animation.thumbnail_url ? (
          <Image
            src={animation.thumbnail_url}
            alt={animation.title}
            fill
            className="object-cover"
            loading="lazy"
            onError={(e) => {
              // Fallback to placeholder on image error
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

        {/* Play overlay */}
        <div className={`absolute inset-0 bg-primary/80 flex items-center justify-center transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <Play className="w-12 h-12 text-text-inverse fill-current" />
        </div>

        {/* Endorsement Badge (Top Right) */}
        {isRfuEndorsed && (
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
        )}

        {/* Visibility badge */}
        {!isRfuEndorsed && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-surface/90 text-xs font-medium z-10">
            {VISIBILITY_ICONS[animation.visibility]}
            <span>{VISIBILITY_LABELS[animation.visibility]}</span>
          </div>
        )}
        {isRfuEndorsed && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-surface/90 text-xs font-medium z-10">
            {VISIBILITY_ICONS[animation.visibility]}
            <span>{VISIBILITY_LABELS[animation.visibility]}</span>
          </div>
        )}

        {/* Phase 2: Progression set badge — links to progression set view */}
        {(animation.progression_count ?? 0) > 0 && (
          <NextLink
            href={`/progression/${animation.id}`}
            onClick={e => e.stopPropagation()}
            className="absolute bottom-2 left-2 px-2 py-0.5 bg-primary/80 text-text-inverse text-xs font-medium rounded-full hover:bg-primary/70 transition-colors"
          >
            +{animation.progression_count} progression{animation.progression_count !== 1 ? 's' : ''}
          </NextLink>
        )}

        {/* Phase 2: Remix count badge */}
        {(animation.remix_count ?? 0) > 0 && (
          <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-surface/80 text-text-primary/70 text-xs font-medium rounded-full">
            {animation.remix_count} remix{animation.remix_count !== 1 ? 'es' : ''}
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
              <NextLink
                href={`/share/${animation.remixed_from_id}`}
                onClick={(e) => e.stopPropagation()}
                className="text-text-primary/70 hover:text-primary hover:underline"
              >
                {animation.remixed_from_title}
              </NextLink>
            ) : (
              <span className="text-text-primary/70">{animation.remixed_from_title}</span>
            )}
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
          <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-medium uppercase">
            {ANIMATION_TYPE_LABELS[animation.animation_type]}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-text-primary/50">
          <span>{formatDate(animation.created_at)}</span>

          <div className="flex items-center gap-1">
            {showCopyLink && canCopyLink && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsShareOpen(true);
                }}
                className={`p-2.5 ${cardActionHover}`}
                aria-label="Share"
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}
            {showActions && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowVersionHistory(true);
                  }}
                  className={`p-2.5 ${cardActionHover}`}
                  aria-label="Version History"
                >
                  <History className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(animation.id);
                  }}
                  className={`p-2.5 ${cardActionHover}`}
                  aria-label="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(animation.id);
                  }}
                  className={`p-2.5 text-red-600 ${cardActionHover}`}
                  aria-label="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Progression strip (T026) — always visible below card body when progressions exist */}
      <ProgressionStrip
        parentId={animation.id}
        progressionCount={animation.progression_count ?? 0}
      />

      {/* V2.0: Version History Modal */}
      {showVersionHistory && (
        <VersionHistoryModal
          animationId={animation.id}
          currentVersion={animation.current_version || '1.0'}
          isOpen={showVersionHistory}
          onClose={() => setShowVersionHistory(false)}
          onRestore={() => {
            setShowVersionHistory(false);
            onRefresh?.();
          }}
        />
      )}

      {/* Share Sheet */}
      <ShareSheet
        animationId={animation.id}
        animationTitle={animation.title}
        open={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
    </div>
  );
}
