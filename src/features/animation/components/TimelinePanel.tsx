'use client';

import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Repeat, 
  Ghost, 
  Share2 
} from 'lucide-react';
import { useProjectStore } from '@/core/stores/projectStore';
import { useUIStore } from '@/core/stores/uiStore';
import { FrameStrip } from '@/features/animation/components/Timeline/FrameStrip';
import { PlaybackSpeed } from '@/core/types';
import { ShareSheet } from '@/features/animation/components/ShareSheet';

export function TimelinePanel() {
  const project = useProjectStore(s => s.project);
  const currentFrameIndex = useProjectStore(s => s.currentFrameIndex);
  const isPlaying = useProjectStore(s => s.isPlaying);
  const playbackSpeed = useProjectStore(s => s.playbackSpeed);
  const loopPlayback = useProjectStore(s => s.loopPlayback);
  const showGhosts = useUIStore(s => s.showGhosts);
  
  const play = useProjectStore.getState().play;
  const pause = useProjectStore.getState().pause;
  const reset = useProjectStore.getState().reset;
  const setCurrentFrame = useProjectStore.getState().setCurrentFrame;
  const addFrame = useProjectStore.getState().addFrame;
  const removeFrame = useProjectStore.getState().removeFrame;
  const duplicateFrame = useProjectStore.getState().duplicateFrame;
  const setPlaybackSpeed = useProjectStore.getState().setPlaybackSpeed;
  const toggleLoop = useProjectStore.getState().toggleLoop;
  const toggleGhosts = useUIStore.getState().toggleGhosts;
  const updateFrame = useProjectStore.getState().updateFrame;

  const [isShareOpen, setIsShareOpen] = useState(false);

  if (!project) return null;

  const totalFrames = project.frames.length;
  const currentFrameId = project.frames[currentFrameIndex]?.id;

  return (
    <aside 
      className="w-64 flex flex-col h-full bg-tactics-white border-l border-border"
      data-testid="timeline-panel"
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-heading font-bold uppercase tracking-wider text-text-primary/70">
          Timeline
        </h2>
      </div>

      {/* Playback Controls */}
      <div className="p-4 space-y-4 border-b border-border">
        {/* Row 1: Main Playback */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={reset}
              className="p-2 hover:bg-surface border border-border rounded-none text-text-primary/70 hover:text-text-primary transition-colors focus-visible:ring-2 focus-visible:ring-warm-accent outline-none"
              aria-label="Reset to frame 1"
              title="Reset"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={() => setCurrentFrame(currentFrameIndex - 1)}
              disabled={currentFrameIndex === 0}
              className="p-2 hover:bg-surface border border-border rounded-none text-text-primary/70 hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus-visible:ring-2 focus-visible:ring-warm-accent outline-none"
              aria-label="Previous frame"
              title="Previous"
            >
              <ChevronLeft size={16} />
            </button>
          </div>

          <button
            onClick={isPlaying ? pause : play}
            className="flex-1 mx-2 py-2 bg-primary text-text-inverse flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors focus-visible:ring-2 focus-visible:ring-warm-accent outline-none rounded-none"
            aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
          >
            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
            <span className="text-xs font-bold uppercase">{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <button
            onClick={() => setCurrentFrame(currentFrameIndex + 1)}
            disabled={currentFrameIndex >= totalFrames - 1}
            className="p-2 hover:bg-surface border border-border rounded-none text-text-primary/70 hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus-visible:ring-2 focus-visible:ring-warm-accent outline-none"
            aria-label="Next frame"
            title="Next"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Row 2: Counter & Speed */}
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-text-primary/60 bg-surface px-2 py-1 border border-border tabular-nums">
            {currentFrameIndex + 1} / {totalFrames}
          </span>
          
          <div className="flex bg-surface border border-border p-0.5">
            {[0.5, 1, 2].map(s => (
              <button
                key={s}
                onClick={() => setPlaybackSpeed(s as PlaybackSpeed)}
                className={`text-[10px] px-2 py-1 transition-all focus-visible:ring-2 focus-visible:ring-warm-accent outline-none rounded-none ${
                  playbackSpeed === s 
                    ? 'bg-primary text-text-inverse font-bold' 
                    : 'text-text-primary/50 hover:text-text-primary'
                }`}
                aria-label={`Speed ${s}x`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Row 3: Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLoop}
            aria-pressed={loopPlayback}
            className={`flex-1 flex items-center justify-center gap-2 py-2 border transition-colors focus-visible:ring-2 focus-visible:ring-warm-accent outline-none rounded-none ${
              loopPlayback 
                ? 'bg-primary/10 border-primary text-primary' 
                : 'bg-tactics-white border-border text-text-primary/50 hover:text-text-primary'
            }`}
            aria-label="Toggle Loop"
            title="Loop Playback"
          >
            <Repeat size={14} className={loopPlayback ? 'animate-spin-slow' : ''} />
            <span className="text-[10px] font-bold uppercase">Loop</span>
          </button>

          <button
            onClick={toggleGhosts}
            aria-pressed={showGhosts}
            className={`flex-1 flex items-center justify-center gap-2 py-2 border transition-colors focus-visible:ring-2 focus-visible:ring-warm-accent outline-none rounded-none ${
              showGhosts 
                ? 'bg-primary/10 border-primary text-primary' 
                : 'bg-tactics-white border-border text-text-primary/50 hover:text-text-primary'
            }`}
            aria-label="Enable ghost mode"
            title="Ghost Mode"
          >
            <Ghost size={14} />
            <span className="text-[10px] font-bold uppercase">Ghost</span>
          </button>
        </div>
      </div>

      {/* Frame List */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        <div className="px-4 py-2 bg-surface/50 border-b border-border flex justify-between items-center">
          <span className="text-[10px] font-bold uppercase text-text-primary/40">Frames</span>
          <div className="flex gap-1">
            <button
              onClick={() => currentFrameId && removeFrame(currentFrameId)}
              disabled={totalFrames <= 1}
              className="p-1 text-text-primary/40 hover:text-red-500 disabled:opacity-20 disabled:cursor-not-allowed transition-colors focus-visible:ring-2 focus-visible:ring-warm-accent outline-none rounded-none"
              aria-label="Delete Frame"
              title="Delete Current Frame"
            >
              <Trash2 size={14} />
            </button>
            <button
              onClick={addFrame}
              className="p-1 text-text-primary/40 hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-warm-accent outline-none rounded-none"
              aria-label="Add Frame"
              title="Add New Frame"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto bg-surface/20">
          <FrameStrip
            frames={project.frames}
            currentFrameIndex={currentFrameIndex}
            onFrameSelect={setCurrentFrame}
            onAddFrame={addFrame}
            onRemoveFrame={removeFrame}
            onDuplicateFrame={duplicateFrame}
            onDurationChange={(id, dur) => updateFrame(id, { duration: dur })}
            orientation="vertical"
          />
        </div>
      </div>

      {/* Footer / Share */}
      {project.id && (
        <div className="p-4 border-t border-border">
          <button
            onClick={() => setIsShareOpen(true)}
            className="w-full py-2 bg-black text-white flex items-center justify-center gap-2 hover:bg-black/80 transition-colors focus-visible:ring-2 focus-visible:ring-warm-accent outline-none rounded-none"
            aria-label="Share animation"
          >
            <Share2 size={16} />
            <span className="text-xs font-bold uppercase tracking-wide">Share Animation</span>
          </button>
        </div>
      )}

      {project.id && (
        <ShareSheet
          animationId={project.id}
          animationTitle={project.name}
          open={isShareOpen}
          onClose={() => setIsShareOpen(false)}
        />
      )}
    </aside>
  );
}
