'use client';

import { AlertTriangle, Loader2 } from 'lucide-react';

interface DeleteConfirmDialogProps {
  title: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({
  title,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onCancel}
      />
      
      {/* Dialog */}
      <div className="relative w-full max-w-sm bg-surface border border-border mx-4 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-heading font-semibold text-text-primary mb-2">
              Delete Animation
            </h3>
            <p className="text-sm text-text-primary/70 mb-4">
              Are you sure you want to delete <strong>&quot;{title}&quot;</strong>? This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 border border-border text-text-primary font-medium hover:bg-surface-warm transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </span>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
