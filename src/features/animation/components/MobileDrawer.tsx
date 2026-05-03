'use client';

import { X, GripHorizontal } from 'lucide-react';
import { EntityPalette } from './Sidebar/EntityPalette';
import { ProjectActions } from './Sidebar/ProjectActions';
import { DrawingMode } from '@/core/types';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  onSaveToCloud?: () => void;
  onAddAttackPlayer: () => void;
  onAddDefensePlayer: () => void;
  onAddBall: () => void;
  onAddCone: () => void;
  onAddTackleShield: () => void;
  onAddTackleBag: () => void;
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
  onAddBall,
  onAddCone,
  onAddTackleShield,
  onAddTackleBag,
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
            <EntityPalette
              onAddAttackPlayer={onAddAttackPlayer}
              onAddDefensePlayer={onAddDefensePlayer}
              onAddBall={onAddBall}
              onAddCone={onAddCone}
              onAddTackleShield={onAddTackleShield}
              onAddTackleBag={onAddTackleBag}
              drawingMode={drawingMode}
              onDrawingModeChange={onDrawingModeChange}
            />
          </ErrorBoundary>
        </div>
      </div>
    </>
  );
}

