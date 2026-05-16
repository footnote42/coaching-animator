'use client';

import { X, GripHorizontal, Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Plus, Trash2, Repeat, Ghost } from 'lucide-react';
import { EntityPalette } from './Sidebar/EntityPalette';
import { ProjectActions } from './Sidebar/ProjectActions';
import { DrawingMode, PlaybackSpeed } from '@/core/types';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { useProjectStore } from '@/core/stores/projectStore';
import { useUIStore } from '@/core/stores/uiStore';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  onSaveToCloud?: () => void;
  onAddAttackPlayer: () => void;
  onAddDefensePlayer: () => void;
  onAddOtherPlayer: () => void;
  onAddBall: () => void;
  onAddCone: () => void;
  onAddTackleShield: () => void;
  onAddTackleBag: () => void;
  teamColors: { attack: string; defense: string; other: string };
  onTeamColorChange: (team: 'attack' | 'defense' | 'other', color: string) => void;
  drawingMode: DrawingMode;
  onDrawingModeChange: (mode: DrawingMode) => void;
}

export function MobileDrawer({
  isOpen,
  onClose,
  isAuthenticated,
  onSaveToCloud,
  onAddAttackPlayer,
  onAddDefensePlayer,
  onAddOtherPlayer,
  onAddBall,
  onAddCone,
  onAddTackleShield,
  onAddTackleBag,
  teamColors,
  onTeamColorChange,
  drawingMode,
  onDrawingModeChange,
}: MobileDrawerProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        id="drawer-backdrop"
        className={`fixed inset-0 bg-primary/50 backdrop-blur-sm z-[60] transition-opacity duration-200 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        data-testid="mobile-drawer-content"
                className={`fixed bottom-0 left-0 right-0 z-[70] bg-tactics-white rounded-none shadow-2xl transition-transform duration-300 ease-out max-h-[85vh] flex flex-col ${
          isOpen ? 'translate-y-0' : 'translate-y-full invisible pointer-events-none'
        }`}
      >
        {/* Handle bar */}
        <div 
          className="flex flex-col items-center py-2 cursor-pointer touch-none"
          onClick={onClose}
        >
          <div className="w-12 h-0.5 bg-border/40 mb-1" />
          <GripHorizontal className="w-4 h-4 text-text-primary/20" />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-none hover:bg-black/5 text-text-primary/40 hover:text-text-primary transition-colors"
          aria-label="Close drawer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-8">
          <ErrorBoundary fallbackTitle="Mobile Drawer Error">
            <ProjectActions
              isAuthenticated={isAuthenticated}
              onSaveToCloud={onSaveToCloud}
            />
            <div className="border-t border-border/50" />
            
            {/* Timeline Controls */}
            <MobileTimelineSection />
            
            <div className="border-t border-border/50" />
            <EntityPalette
              onAddAttackPlayer={onAddAttackPlayer}
              onAddDefensePlayer={onAddDefensePlayer}
              onAddOtherPlayer={onAddOtherPlayer}
              onAddBall={onAddBall}
              onAddCone={onAddCone}
              onAddTackleShield={onAddTackleShield}
              onAddTackleBag={onAddTackleBag}
              teamColors={teamColors}
              onTeamColorChange={onTeamColorChange}
              drawingMode={drawingMode}
              onDrawingModeChange={onDrawingModeChange}
            />
          </ErrorBoundary>
        </div>
      </div>
    </>
  );
}

function MobileTimelineSection() {
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
  const setPlaybackSpeed = useProjectStore.getState().setPlaybackSpeed;
  const toggleLoop = useProjectStore.getState().toggleLoop;
  const toggleGhosts = useUIStore.getState().toggleGhosts;

  if (!project) return null;

  const totalFrames = project.frames.length;
  const currentFrameId = project.frames[currentFrameIndex]?.id;

  return (
    <div className="p-6">
      <h3 className="text-sm font-heading font-bold uppercase tracking-wider text-text-primary/70 mb-4">
        Timeline
      </h3>

      <div className="space-y-6">
        {/* Playback Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={reset}
              className="p-3 bg-surface border border-border rounded-none text-text-primary/70 active:bg-black/5"
              aria-label="Reset to frame 1"
            >
              <RotateCcw size={18} />
            </button>
            <button
              onClick={() => setCurrentFrame(currentFrameIndex - 1)}
              disabled={currentFrameIndex === 0}
              className="p-3 bg-surface border border-border rounded-none text-text-primary/70 disabled:opacity-20 active:bg-black/5"
              aria-label="Previous frame"
            >
              <ChevronLeft size={18} />
            </button>
          </div>

          <button
            onClick={isPlaying ? pause : play}
            className="flex-1 py-3 bg-primary text-text-inverse flex items-center justify-center gap-2 rounded-none shadow-lg active:scale-95 transition-transform"
            aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            <span className="font-bold uppercase tracking-wide">{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <button
            onClick={() => setCurrentFrame(currentFrameIndex + 1)}
            disabled={currentFrameIndex >= totalFrames - 1}
            className="p-3 bg-surface border border-border rounded-none text-text-primary/70 disabled:opacity-20 active:bg-black/5"
            aria-label="Next frame"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Speed & Toggles */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-text-primary/40 ml-1">Speed</label>
            <div className="flex bg-surface border border-border p-0.5 w-full">
              {[0.5, 1, 2].map(s => (
                <button
                  key={s}
                  onClick={() => setPlaybackSpeed(s as PlaybackSpeed)}
                  className={`flex-1 text-xs py-2 transition-all rounded-none ${
                    playbackSpeed === s 
                      ? 'bg-primary text-text-inverse font-bold shadow-sm' 
                      : 'text-text-primary/50'
                  }`}
                  aria-label={`Speed ${s}x`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-text-primary/40 ml-1">Settings</label>
            <div className="flex gap-2">
              <button
                onClick={toggleLoop}
                aria-pressed={loopPlayback}
                className={`flex-1 py-2 border rounded-none flex items-center justify-center ${
                  loopPlayback ? 'bg-primary/10 border-primary text-primary' : 'bg-surface border-border text-text-primary/40'
                }`}
                aria-label="Toggle Loop"
              >
                <Repeat size={16} className={loopPlayback ? 'animate-spin-slow' : ''} />
              </button>
              <button
                onClick={toggleGhosts}
                aria-pressed={showGhosts}
                className={`flex-1 py-2 border rounded-none flex items-center justify-center ${
                  showGhosts ? 'bg-primary/10 border-primary text-primary' : 'bg-surface border-border text-text-primary/40'
                }`}
                aria-label="Toggle Ghost Mode"
              >
                <Ghost size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Frame Actions */}
        <div className="flex gap-2">
          <button
            onClick={addFrame}
            className="flex-1 py-3 bg-surface border-2 border-primary/20 text-primary flex items-center justify-center gap-2 rounded-none font-bold uppercase text-xs active:bg-primary/5 transition-colors"
            aria-label="Add Frame"
          >
            <Plus size={16} />
            Add Frame
          </button>
          <button
            onClick={() => currentFrameId && removeFrame(currentFrameId)}
            disabled={totalFrames <= 1}
            className="px-4 py-3 bg-surface border border-border text-red-500 disabled:opacity-20 flex items-center justify-center rounded-none active:bg-red-50 transition-colors"
            aria-label="Delete Frame"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

