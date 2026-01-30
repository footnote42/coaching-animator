'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ThumbsUp, Share2, Flag, ArrowLeft, Check, Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { createSupabaseBrowserClient } from '../../../lib/supabase/client';

interface Animation {
  id: string;
  title: string;
  description: string | null;
  coaching_notes: string | null;
  animation_type: string;
  tags: string[];
  payload: {
    version: string;
    name: string;
    sport: string;
    frames: Frame[];
    settings: Record<string, unknown>;
  };
  duration_ms: number;
  frame_count: number;
  upvote_count: number;
  view_count: number;
  created_at: string;
  user_id: string;
  author: {
    display_name: string | null;
  };
}

interface Frame {
  id: string;
  duration?: number;
  entities: Record<string, Entity>;
  annotations?: Annotation[];
}

interface Entity {
  id: string;
  type: 'player' | 'ball' | 'cone' | 'marker';
  x: number;
  y: number;
  team: 'attack' | 'defense' | 'neutral';
  color: string;
  label?: string;
}

interface Annotation {
  id: string;
  type: 'arrow' | 'line';
  points: number[];
  color: string;
}

interface GalleryDetailClientProps {
  animation: Animation;
}

export function GalleryDetailClient({ animation }: GalleryDetailClientProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(animation.upvote_count);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Playback state
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const frames = animation.payload?.frames || [];
  const currentFrame = frames[currentFrameIndex];

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);

      if (user) {
        // Check if user has upvoted
        const response = await fetch(`/api/animations/${animation.id}`);
        if (response.ok) {
          const data = await response.json();
          setHasUpvoted(data.user_has_upvoted || false);
        }
      }
    };
    checkAuth();
  }, [animation.id]);

  const nextFrame = useCallback(() => {
    setCurrentFrameIndex((prev) => {
      if (prev >= frames.length - 1) {
        setIsPlaying(false);
        return prev;
      }
      return prev + 1;
    });
  }, [frames.length]);

  useEffect(() => {
    if (!isPlaying || !currentFrame) return;
    const duration = currentFrame.duration || 1000;
    const timer = setTimeout(nextFrame, duration);
    return () => clearTimeout(timer);
  }, [isPlaying, currentFrame, nextFrame]);

  const handleUpvote = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/gallery/${animation.id}`);
      return;
    }

    setIsUpvoting(true);
    try {
      const response = await fetch(`/api/animations/${animation.id}/upvote`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setHasUpvoted(data.upvoted);
        setUpvoteCount(data.upvote_count);
      }
    } catch (err) {
      console.error('Failed to upvote:', err);
    } finally {
      setIsUpvoting(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleReport = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/gallery/${animation.id}`);
      return;
    }
    // TODO: Implement report modal
    alert('Report functionality coming soon');
  };

  const togglePlay = () => {
    if (currentFrameIndex >= frames.length - 1) {
      setCurrentFrameIndex(0);
    }
    setIsPlaying((prev) => !prev);
  };

  const reset = () => {
    setCurrentFrameIndex(0);
    setIsPlaying(false);
  };

  const entities = currentFrame ? Object.values(currentFrame.entities || {}) : [];
  const annotations = currentFrame?.annotations || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-surface">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/gallery')}
            className="flex items-center gap-2 text-sm text-primary hover:underline mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Gallery
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-heading font-bold text-text-primary">
                {animation.title}
              </h1>
              <p className="text-sm text-text-primary/70 mt-1">
                By {animation.author.display_name || 'Anonymous Coach'} • {new Date(animation.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleUpvote}
                disabled={isUpvoting}
                className={`flex items-center gap-2 px-4 py-2 border transition-colors ${
                  hasUpvoted
                    ? 'bg-primary text-text-inverse border-primary'
                    : 'border-border hover:border-primary'
                }`}
              >
                <ThumbsUp className={`w-4 h-4 ${hasUpvoted ? 'fill-current' : ''}`} />
                <span>{upvoteCount}</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 border border-border hover:border-primary transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Share'}
              </button>

              <button
                onClick={handleReport}
                className="p-2 border border-border hover:border-red-300 hover:text-red-600 transition-colors"
                title="Report"
              >
                <Flag className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Animation viewer */}
        <div className="mb-8">
          <div className="relative w-full max-w-[800px] mx-auto aspect-[4/3] bg-green-700 border border-border overflow-hidden">
            {/* Field markings */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/30" />
              <div className="absolute top-1/2 left-0 right-0 h-px bg-white/30" />
            </div>

            {/* Annotations */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {annotations.map((annotation) => {
                if (annotation.points.length < 4) return null;
                const pathData = annotation.points.reduce((acc, point, i) => {
                  const x = (point / 800) * 100;
                  const y = (annotation.points[i + 1] / 600) * 100;
                  if (i % 2 === 0) {
                    return acc + (i === 0 ? `M ${x}% ${y}%` : ` L ${x}% ${y}%`);
                  }
                  return acc;
                }, '');
                return (
                  <path
                    key={annotation.id}
                    d={pathData}
                    stroke={annotation.color}
                    strokeWidth="2"
                    fill="none"
                    markerEnd={annotation.type === 'arrow' ? 'url(#arrowhead)' : undefined}
                  />
                );
              })}
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#FFA500" />
                </marker>
              </defs>
            </svg>

            {/* Entities */}
            {entities.map((entity) => {
              const left = (entity.x / 800) * 100;
              const top = (entity.y / 600) * 100;
              return (
                <div
                  key={entity.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
                  style={{ left: `${left}%`, top: `${top}%` }}
                >
                  {entity.type === 'player' && (
                    <div
                      className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-md"
                      style={{ backgroundColor: entity.color }}
                    >
                      {entity.label || ''}
                    </div>
                  )}
                  {entity.type === 'ball' && (
                    <div className="w-5 h-5 rounded-full shadow-md" style={{ backgroundColor: entity.color }} />
                  )}
                  {entity.type === 'cone' && (
                    <div
                      className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[16px] border-l-transparent border-r-transparent"
                      style={{ borderBottomColor: entity.color }}
                    />
                  )}
                  {entity.type === 'marker' && (
                    <div className="w-4 h-4 rotate-45" style={{ backgroundColor: entity.color }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Controls */}
          <div className="mt-4 flex items-center justify-center gap-4">
            <button onClick={reset} className="p-2 border border-border hover:bg-surface-warm" title="Reset">
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentFrameIndex(Math.max(0, currentFrameIndex - 1))}
              disabled={currentFrameIndex === 0}
              className="p-2 border border-border hover:bg-surface-warm disabled:opacity-50"
              title="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={togglePlay} className="p-3 bg-primary text-text-inverse" title={isPlaying ? 'Pause' : 'Play'}>
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
            <button
              onClick={() => setCurrentFrameIndex(Math.min(frames.length - 1, currentFrameIndex + 1))}
              disabled={currentFrameIndex >= frames.length - 1}
              className="p-2 border border-border hover:bg-surface-warm disabled:opacity-50"
              title="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <span className="text-sm text-text-primary/70 ml-2">
              Frame {currentFrameIndex + 1} / {frames.length}
            </span>
          </div>

          {/* Frame strip */}
          <div className="mt-4 flex gap-1 overflow-x-auto pb-2 justify-center">
            {frames.map((_, index) => (
              <button
                key={index}
                onClick={() => { setCurrentFrameIndex(index); setIsPlaying(false); }}
                className={`w-8 h-8 flex-shrink-0 border transition-colors ${
                  index === currentFrameIndex ? 'bg-primary text-text-inverse border-primary' : 'bg-surface border-border hover:border-primary'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Description and metadata */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {animation.description && (
              <div className="mb-6">
                <h2 className="text-lg font-heading font-semibold mb-2">Description</h2>
                <p className="text-text-primary/80 whitespace-pre-wrap">{animation.description}</p>
              </div>
            )}
            {animation.coaching_notes && (
              <div>
                <h2 className="text-lg font-heading font-semibold mb-2">Coaching Notes</h2>
                <p className="text-text-primary/80 whitespace-pre-wrap">{animation.coaching_notes}</p>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-heading font-semibold mb-4">Details</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-text-primary/50">Type</dt>
                <dd className="font-medium capitalize">{animation.animation_type}</dd>
              </div>
              <div>
                <dt className="text-text-primary/50">Frames</dt>
                <dd className="font-medium">{animation.frame_count}</dd>
              </div>
              <div>
                <dt className="text-text-primary/50">Duration</dt>
                <dd className="font-medium">{Math.round(animation.duration_ms / 1000)}s</dd>
              </div>
              <div>
                <dt className="text-text-primary/50">Views</dt>
                <dd className="font-medium">{animation.view_count}</dd>
              </div>
              {animation.tags && animation.tags.length > 0 && (
                <div>
                  <dt className="text-text-primary/50 mb-1">Tags</dt>
                  <dd className="flex flex-wrap gap-1">
                    {animation.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium">
                        {tag}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </main>

      {/* CTA Footer */}
      <footer className="border-t border-border bg-surface-warm mt-12">
        <div className="max-w-5xl mx-auto px-4 py-8 text-center">
          <p className="text-text-primary/70 mb-4">
            Want to create your own rugby animations?
          </p>
          <a
            href="/app"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-text-inverse font-medium hover:bg-primary/90"
          >
            Start Creating
          </a>
        </div>
      </footer>
    </div>
  );
}
