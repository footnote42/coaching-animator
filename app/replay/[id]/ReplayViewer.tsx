'use client';

import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

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

interface Payload {
  version: string;
  name: string;
  sport: string;
  frames: Frame[];
  settings: Record<string, unknown>;
}

interface ReplayViewerProps {
  payload: Payload;
}

export function ReplayViewer({ payload }: ReplayViewerProps) {
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const frames = payload?.frames || [];
  const currentFrame = frames[currentFrameIndex];

  const nextFrame = useCallback(() => {
    setCurrentFrameIndex((prev) => {
      if (prev >= frames.length - 1) {
        setIsPlaying(false);
        return prev;
      }
      return prev + 1;
    });
  }, [frames.length]);

  const prevFrame = useCallback(() => {
    setCurrentFrameIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const reset = useCallback(() => {
    setCurrentFrameIndex(0);
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (currentFrameIndex >= frames.length - 1) {
      setCurrentFrameIndex(0);
    }
    setIsPlaying((prev) => !prev);
  }, [currentFrameIndex, frames.length]);

  useEffect(() => {
    if (!isPlaying || !currentFrame) return;

    const duration = currentFrame.duration || 1000;
    const timer = setTimeout(nextFrame, duration);

    return () => clearTimeout(timer);
  }, [isPlaying, currentFrame, nextFrame]);

  if (!frames.length) {
    return (
      <div className="text-center py-20 text-text-primary/70">
        No frames to display
      </div>
    );
  }

  const entities = currentFrame ? Object.values(currentFrame.entities || {}) : [];
  const annotations = currentFrame?.annotations || [];

  return (
    <div className="flex flex-col items-center">
      {/* Canvas */}
      <div className="relative w-full max-w-[800px] aspect-[4/3] bg-green-700 border border-border overflow-hidden">
        {/* Field markings - simplified */}
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
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
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
                <div
                  className="w-5 h-5 rounded-full shadow-md"
                  style={{ backgroundColor: entity.color }}
                />
              )}
              {entity.type === 'cone' && (
                <div
                  className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[16px] border-l-transparent border-r-transparent"
                  style={{ borderBottomColor: entity.color }}
                />
              )}
              {entity.type === 'marker' && (
                <div
                  className="w-4 h-4 rotate-45"
                  style={{ backgroundColor: entity.color }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="mt-4 flex items-center gap-4">
        <button
          onClick={reset}
          className="p-2 border border-border hover:bg-surface-warm transition-colors"
          title="Reset"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={prevFrame}
          disabled={currentFrameIndex === 0}
          className="p-2 border border-border hover:bg-surface-warm transition-colors disabled:opacity-50"
          title="Previous frame"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={togglePlay}
          className="p-3 bg-primary text-text-inverse hover:bg-primary/90 transition-colors"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </button>

        <button
          onClick={nextFrame}
          disabled={currentFrameIndex >= frames.length - 1}
          className="p-2 border border-border hover:bg-surface-warm transition-colors disabled:opacity-50"
          title="Next frame"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <span className="text-sm text-text-primary/70 ml-2">
          Frame {currentFrameIndex + 1} / {frames.length}
        </span>
      </div>

      {/* Frame strip */}
      <div className="mt-4 flex gap-1 overflow-x-auto pb-2 max-w-full">
        {frames.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentFrameIndex(index);
              setIsPlaying(false);
            }}
            className={`w-8 h-8 flex-shrink-0 border transition-colors ${
              index === currentFrameIndex
                ? 'bg-primary text-text-inverse border-primary'
                : 'bg-surface border-border hover:border-primary'
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
