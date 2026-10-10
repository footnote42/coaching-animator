'use client';

import React, { useEffect, useMemo, useRef, useState, type ComponentType } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  ListVideo,
  MessageSquare,
  Flag,
  Copy,
  Share2,
  Maximize,
  Minimize,
  MoreVertical,
} from 'lucide-react';
import { toast } from 'sonner';
import { sharePracticeLink } from '@/shared/share';
import { Button } from '@/shared/ui/button';
import { BrandIcon } from '@/shared/components/BrandIcon';
import { positionsAt, resolveStep, stepCount, type ResolvedStep } from '@/features/practice/engine';
import { PracticeThumbnail } from '@/features/practice/components/PracticeThumbnail';
import { ReportPracticeDialog } from '@/features/practice/components/ReportPracticeDialog';
import type { PracticeScript } from '@/features/practice/schema';

const LEVER_NAMES = { space: 'Space', time: 'Time', equipment: 'Equipment', people: 'People' } as const;

const COMMENTARY_STORAGE_KEY = 'ca_share_show_commentary';

export const PLAYBACK_SPEEDS = [
  { value: 0.5, label: '½×', name: '½× speed' },
  { value: 1, label: '1×', name: '1× speed' },
  { value: 2, label: '2×', name: '2× speed' },
] as const;

/** Seconds "play all" rests on a finished Step before moving to the next. */
const PLAY_ALL_HOLD_S = 1.5;

/** Every control is at least 44px square. */
const CONTROL = 'h-11 min-w-11 px-3 border-border bg-transparent text-text-primary hover:bg-text-primary/10 hover:text-text-primary';
const CONTROL_ON = 'bg-text-primary text-background hover:bg-text-primary/90 hover:text-background';

type CanvasComponent = ComponentType<{ step: ResolvedStep; time: number }>;

interface PracticeShareViewerProps {
  /** Practice id; when set, the header shows a Report button. */
  practiceId?: string;
  title: string;
  /** The Practice's Tags, shown under the title. */
  tags?: string[];
  /** The Source: an https link out, opened in a new tab. Never embedded. */
  sourceUrl?: string | null;
  sourceTitle?: string | null;
  /** A validated Practice Script. */
  script: PracticeScript;
}

/**
 * Full-screen, no-scroll viewer for a shared Practice at /p/[id]. Opens on
 * Step 0 with previous/next Step, play/pause, "play all", speed, Commentary toggle,
 * brand navigation, sharing, full screen (where available), and overflow menu.
 * Shows a static thumbnail until the canvas has loaded.
 */
export function PracticeShareViewer({ practiceId, title, tags, sourceUrl, sourceTitle, script }: PracticeShareViewerProps) {
  const [reporting, setReporting] = useState(false);
  const steps = stepCount(script);
  const [stepIndex, setStepIndex] = useState(0);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [playAll, setPlayAll] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [Canvas, setCanvas] = useState<CanvasComponent | null>(null);
  const [fullscreenAvailable, setFullscreenAvailable] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const lastFrame = useRef<number | null>(null);

  // Starts shown to match the server render; the saved choice, or collapsed on phones, applies after hydration.
  const [showCommentary, setShowCommentary] = useState(true);
  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(COMMENTARY_STORAGE_KEY);
      if (saved !== null) setShowCommentary(saved === 'true');
      else setShowCommentary(!((typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 767px)').matches) || window.innerWidth < 768));
    } catch {
      // sessionStorage blocked: keep it shown
    }
  }, []);

  const updateCommentary = (next: boolean | ((prev: boolean) => boolean)) => {
    setShowCommentary((prev) => {
      const val = typeof next === 'function' ? next(prev) : next;
      try {
        window.sessionStorage.setItem(COMMENTARY_STORAGE_KEY, String(val));
      } catch {
        // sessionStorage failure fallback
      }
      return val;
    });
  };

  const step = useMemo(() => resolveStep(script, stepIndex), [script, stepIndex]);
  const duration = useMemo(() => positionsAt(step, 0).duration, [step]);
  const end = duration + (playAll && stepIndex < steps - 1 ? PLAY_ALL_HOLD_S : 0);

  // Check Fullscreen API availability on mount and track fullscreen state.
  useEffect(() => {
    const doc = typeof document !== 'undefined' ? document : null;
    if (!doc) return;

    const hasFs = Boolean(
      doc.fullscreenEnabled ||
        (doc as unknown as { webkitFullscreenEnabled?: boolean }).webkitFullscreenEnabled,
    );
    setFullscreenAvailable(hasFs);

    const onFsChange = () => {
      const fsEl =
        doc.fullscreenElement ||
        (doc as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement;
      setIsFullscreen(Boolean(fsEl));
    };

    doc.addEventListener('fullscreenchange', onFsChange);
    doc.addEventListener('webkitfullscreenchange', onFsChange);
    return () => {
      doc.removeEventListener('fullscreenchange', onFsChange);
      doc.removeEventListener('webkitfullscreenchange', onFsChange);
    };
  }, []);

  // Close overflow menu on outside click or Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onClickOutside);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, [menuOpen]);

  // Konva needs the browser: load it after mount, then start Step 0 playing.
  useEffect(() => {
    let cancelled = false;
    void import('@/features/practice/components/PracticeCanvas').then((m) => {
      if (cancelled) return;
      setCanvas(() => m.default);
      setPlaying(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const tick = (now: number) => {
      const dt = lastFrame.current === null ? 0 : (now - lastFrame.current) / 1000;
      lastFrame.current = now;
      setTime((t) => Math.min(t + dt * speed, end));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      lastFrame.current = null;
    };
  }, [playing, speed, end]);

  useEffect(() => {
    if (!playing || time < end) return;
    if (playAll && stepIndex < steps - 1) {
      setStepIndex(stepIndex + 1);
      setTime(0);
    } else {
      setPlaying(false);
      setPlayAll(false);
    }
  }, [playing, playAll, time, end, stepIndex, steps]);

  const goTo = (n: number) => {
    setStepIndex(n);
    setTime(0);
    setPlayAll(false);
    setPlaying(true);
  };

  const togglePlay = () => {
    if (playing) return setPlaying(false);
    if (time >= end) setTime(0);
    setPlaying(true);
  };

  const togglePlayAll = () => {
    if (playAll) return setPlayAll(false);
    setStepIndex(0);
    setTime(0);
    setPlayAll(true);
    setPlaying(true);
  };

  const toggleFullscreen = async () => {
    if (!fullscreenAvailable) return;
    try {
      const doc = document as unknown as {
        fullscreenElement?: Element;
        webkitFullscreenElement?: Element;
        exitFullscreen?: () => Promise<void>;
        webkitExitFullscreen?: () => Promise<void>;
      };
      const isFs = Boolean(doc.fullscreenElement || doc.webkitFullscreenElement);
      if (!isFs) {
        const el = (rootRef.current ?? document.documentElement) as unknown as {
          requestFullscreen?: () => Promise<void>;
          webkitRequestFullscreen?: () => Promise<void>;
        };
        if (el.requestFullscreen) {
          await el.requestFullscreen();
        } else if (el.webkitRequestFullscreen) {
          await el.webkitRequestFullscreen();
        }
      } else {
        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        }
      }
    } catch (err) {
      console.error('[ShareViewer] Fullscreen error:', err);
    }
  };

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const result = await sharePracticeLink(url, title);
    if (result === 'copied') toast.success('Link copied.');
    else if (result === 'failed') toast.error("Couldn't copy link.");
  };

  /** Copy the Practice Script, e.g. to adapt it in Import script or hand it to an AI. */
  const copyScript = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(script, null, 2));
      toast.success('Script copied.');
    } catch {
      toast.error("Couldn't copy the script.");
    }
  };

  const hasCommentary = Boolean(step.lever) || step.commentary.points.length > 0;
  const stepLabel =
    step.index === 0 ? 'Base Step' : step.lever ? `Step ${step.index}: ${LEVER_NAMES[step.lever]} lever` : `Step ${step.index}`;

  return (
    <div
      ref={rootRef}
      style={{ position: 'fixed', inset: 0 }}
      className="z-50 flex flex-col overflow-hidden bg-background text-text-primary"
    >
      <header className="flex min-h-12 items-center gap-2 border-b border-border/30 px-3 py-1.5 pt-[max(0.375rem,env(safe-area-inset-top))]">
        <Link
          href="/"
          className="flex shrink-0 items-center justify-center rounded p-1 text-text-primary hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Coaching Animator home"
          title="Coaching Animator home"
        >
          <BrandIcon variant="share-viewer" />
        </Link>
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <h1 className="truncate font-heading text-sm font-bold sm:text-base md:text-lg">{title}</h1>
          <p className="truncate text-xs text-text-muted" aria-live="polite">
            {stepLabel} ({stepIndex + 1}/{steps})
          </p>
          {tags && tags.length > 0 && (
            <p className="truncate text-xs text-text-muted">{tags.join(' · ')}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Button
            variant="outline"
            className={CONTROL}
            aria-label="Share"
            title="Share"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
          </Button>
          {fullscreenAvailable && (
            <Button
              variant="outline"
              className={CONTROL}
              aria-label={isFullscreen ? 'Exit full screen' : 'Full screen'}
              title={isFullscreen ? 'Exit full screen' : 'Full screen'}
              onClick={toggleFullscreen}
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          )}
          {practiceId && (
            <Button
              variant="outline"
              className={`${CONTROL} gap-1.5`}
              aria-label="Report"
              title="Report"
              onClick={() => setReporting(true)}
            >
              <Flag className="h-4 w-4" />
              <span>Report</span>
            </Button>
          )}
          <div ref={menuRef} className="relative">
            <Button
              variant="outline"
              className={CONTROL}
              aria-label="More options"
              title="More options"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-50 mt-1 w-64 rounded-md border border-border bg-surface p-2 text-text-primary shadow-xl"
              >
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full flex-col items-start gap-1 rounded p-2 text-left hover:bg-text-primary/10 focus:bg-text-primary/10 focus:outline-none"
                  onClick={async () => {
                    setMenuOpen(false);
                    await copyScript();
                  }}
                >
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <Copy className="h-4 w-4" />
                    Copy script
                  </span>
                  <span className="text-xs text-text-muted">
                    Copy the Practice Script to adapt or hand to an AI.
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="relative min-h-0 flex-1">
        {Canvas ? (
          <Canvas step={step} time={Math.min(time, duration)} />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <PracticeThumbnail step={step} showMoves={false} className="h-full w-full" />
          </div>
        )}
        {showCommentary && hasCommentary && (
          <div
            aria-live="polite"
            className="pointer-events-auto absolute left-2 top-2 max-w-[calc(100%-1rem)] rounded border border-border bg-surface/95 p-3 text-sm text-text-primary shadow-lg backdrop-blur-sm sm:max-w-sm"
          >
            <p className="font-medium">{stepLabel}</p>
            {step.commentary.points.length > 0 && (
              <ul className="mt-1.5 list-disc space-y-1 pl-5 text-text-primary">
                {step.commentary.points.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </main>

      {sourceUrl && (
        <p className="truncate px-3 pt-2 text-center text-sm">
          <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
            Watch the original
          </a>
          {sourceTitle && <span className="text-text-muted">: {sourceTitle}</span>}
        </p>
      )}

      <nav
        aria-label="Playback"
        className="flex flex-wrap items-center justify-center gap-1 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      >
        <Button
          variant="outline"
          className={CONTROL}
          aria-label="Previous Step"
          title="Previous Step"
          disabled={stepIndex === 0}
          onClick={() => goTo(stepIndex - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className={CONTROL}
          aria-label={playing ? 'Pause' : 'Play'}
          title={playing ? 'Pause' : 'Play'}
          onClick={togglePlay}
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button
          variant="outline"
          className={CONTROL}
          aria-label="Next Step"
          title="Next Step"
          disabled={stepIndex === steps - 1}
          onClick={() => goTo(stepIndex + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className={`${CONTROL} ${playAll ? CONTROL_ON : ''} gap-1.5`}
          aria-label="Play all Steps"
          title="Play all Steps"
          aria-pressed={playAll}
          onClick={togglePlayAll}
        >
          <ListVideo className="h-4 w-4" />
          <span>Play all</span>
        </Button>
        <Button
          variant="outline"
          className={`${CONTROL} ${showCommentary ? CONTROL_ON : ''}`}
          aria-label={showCommentary ? 'Hide Commentary' : 'Show Commentary'}
          title={showCommentary ? 'Hide Commentary' : 'Show Commentary'}
          aria-pressed={showCommentary}
          onClick={() => updateCommentary((v) => !v)}
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
        <div role="group" aria-label="Speed" className="flex">
          {PLAYBACK_SPEEDS.map((option) => (
            <Button
              key={option.value}
              variant="outline"
              className={`${CONTROL} ${speed === option.value ? CONTROL_ON : ''}`}
              aria-label={option.name}
              title={option.name}
              aria-pressed={speed === option.value}
              onClick={() => setSpeed(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </nav>
      {reporting && practiceId && <ReportPracticeDialog practiceId={practiceId} onClose={() => setReporting(false)} />}
    </div>
  );
}

export default PracticeShareViewer;

