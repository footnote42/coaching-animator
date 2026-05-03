import React from 'react';
import { X } from 'lucide-react';

interface CoachingNotesOverlayProps {
  coachingNotes: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CoachingNotesOverlay({ coachingNotes, isOpen, onClose }: CoachingNotesOverlayProps) {
  if (!coachingNotes || !isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-40 bg-transparent" 
        onClick={onClose}
        aria-hidden="true"
      />
      <div 
        className="absolute bottom-20 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 sm:max-w-[calc(100vw-32px)] bg-surface border border-border shadow-xl z-50 animate-in slide-in-from-bottom-2 duration-200"
      >
        <div className="flex items-center justify-between p-3 border-b border-border bg-surface-warm">
          <h3 className="font-heading font-semibold text-text-primary text-sm">Coaching Notes</h3>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-surface transition-colors"
            aria-label="Close notes"
          >
            <X className="w-4 h-4 text-text-primary/70 hover:text-text-primary" />
          </button>
        </div>
        <div className="p-4 max-h-[40vh] overflow-y-auto">
          <p className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">
            {coachingNotes}
          </p>
        </div>
      </div>
    </>
  );
}
