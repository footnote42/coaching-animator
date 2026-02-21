'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Play, Loader2, ChevronLeft, Layers } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimationType } from '@/lib/schemas/animations';

interface ProgressionStep {
  id: string;
  title: string;
  description: string | null;
  animation_type: AnimationType;
  duration_ms: number;
  frame_count: number;
  thumbnail_url: string | null;
  progression_order: number;
}

interface BaseAnimation {
  id: string;
  title: string;
  description: string | null;
  animation_type: AnimationType;
  duration_ms: number;
  frame_count: number;
  thumbnail_url: string | null;
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  return seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

function StepCard({
  step,
  label,
  index,
}: {
  step: BaseAnimation | ProgressionStep;
  label: string;
  index: number;
}) {
  const isBase = index === 0;

  return (
    <div className="flex gap-4 p-4 border border-border bg-surface hover:border-primary transition-colors group">
      {/* Step number */}
      <div className="shrink-0 flex flex-col items-center">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            isBase
              ? 'bg-primary text-text-inverse'
              : 'bg-indigo-600 text-white'
          }`}
        >
          {index + 1}
        </div>
        {/* Connector line */}
        <div className="w-0.5 flex-1 mt-2 bg-border" />
      </div>

      {/* Thumbnail */}
      <div className="relative w-32 aspect-[4/3] shrink-0 bg-surface-warm overflow-hidden">
        {step.thumbnail_url ? (
          <Image
            src={step.thumbnail_url}
            alt={step.title}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-text-primary/30 text-xs">
            {step.frame_count} frames
          </div>
        )}
        <div className="absolute inset-0 bg-primary/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Play className="w-8 h-8 text-white fill-current" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            isBase ? 'bg-primary/10 text-primary' : 'bg-indigo-500/10 text-indigo-600'
          }`}>
            {label}
          </span>
        </div>
        <h3 className="font-heading font-semibold text-text-primary truncate mb-1">
          {step.title}
        </h3>
        {step.description && (
          <p className="text-sm text-text-primary/60 line-clamp-2 mb-2">
            {step.description}
          </p>
        )}
        <div className="flex items-center gap-3 text-xs text-text-primary/50">
          <span>{formatDuration(step.duration_ms)}</span>
          <span className="flex items-center gap-1">
            <Layers className="w-3 h-3" />
            {step.frame_count} frames
          </span>
        </div>
      </div>

      {/* Watch button */}
      <div className="shrink-0 flex items-center">
        <Link
          href={`/replay/${step.id}`}
          onClick={e => e.stopPropagation()}
          className="flex items-center gap-1.5 px-3 py-2 bg-primary text-text-inverse text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Play className="w-4 h-4 fill-current" />
          Watch
        </Link>
      </div>
    </div>
  );
}

export default function ProgressionSetPage() {
  const params = useParams();
  const router = useRouter();
  const baseId = params.id as string;

  const [base, setBase] = useState<BaseAnimation | null>(null);
  const [progressions, setProgressions] = useState<ProgressionStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [baseRes, progsRes] = await Promise.all([
          fetch(`/api/animations/${baseId}`),
          fetch(`/api/animations/${baseId}/progressions`),
        ]);

        if (!baseRes.ok) {
          throw new Error(baseRes.status === 404 ? 'Animation not found' : 'Failed to load animation');
        }

        const baseData = await baseRes.json();
        setBase({
          id: baseData.id,
          title: baseData.title,
          description: baseData.description ?? null,
          animation_type: baseData.animation_type,
          duration_ms: baseData.duration_ms,
          frame_count: baseData.frame_count,
          thumbnail_url: baseData.thumbnail_url ?? null,
        });

        if (progsRes.ok) {
          const progsData = await progsRes.json();
          setProgressions(progsData.progressions ?? []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [baseId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !base) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-heading font-bold text-text-primary mb-4">
            {error ?? 'Not found'}
          </h1>
          <button
            onClick={() => router.push('/gallery')}
            className="px-4 py-2 bg-primary text-text-inverse font-medium"
          >
            Back to Gallery
          </button>
        </div>
      </div>
    );
  }

  const totalSteps = 1 + progressions.length;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-primary text-text-inverse">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-text-inverse/70 hover:text-text-inverse text-sm mb-3 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-2xl font-heading font-bold mb-1">{base.title}</h1>
          <p className="text-text-inverse/70 text-sm">
            {totalSteps} step{totalSteps !== 1 ? 's' : ''} — Base drill + {progressions.length} progression{progressions.length !== 1 ? 's' : ''}
          </p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {progressions.length === 0 ? (
          <div className="text-center py-12 text-text-primary/50">
            <p>No progressions have been added to this drill yet.</p>
            <Link
              href={`/replay/${base.id}`}
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary text-text-inverse font-medium hover:bg-primary/90 transition-colors"
            >
              <Play className="w-4 h-4 fill-current" />
              Watch Base Drill
            </Link>
          </div>
        ) : (
          <div className="space-y-0">
            {/* Base step */}
            <StepCard step={base} label="Base Drill" index={0} />
            {/* Progression steps */}
            {progressions.map((prog, i) => (
              <StepCard
                key={prog.id}
                step={prog}
                label={`Progression ${i + 1}`}
                index={i + 1}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
