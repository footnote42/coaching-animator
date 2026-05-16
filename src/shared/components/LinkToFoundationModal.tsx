'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { getWithRetry, fetchWithRetry } from '@/lib/api-client';
import { AnimationSummary } from '@/features/gallery/components/AnimationCard';

interface LinkToFoundationModalProps {
  animation: AnimationSummary;
  onClose: () => void;
  onSuccess: () => void;
}

export function LinkToFoundationModal({ animation, onClose, onSuccess }: LinkToFoundationModalProps) {
  const [selectedFoundationId, setSelectedFoundationId] = useState<string>('');
  const [foundations, setFoundations] = useState<{ id: string; title: string; progression_count: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getWithRetry<{ animations: { id: string; title: string; progression_count: number }[] }>('/api/animations?limit=50').then((res) => {
      if (res.ok && res.data) {
        // Filter out the animation itself if it happens to be in the list
        setFoundations(res.data.animations.filter(a => a.id !== animation.id));
      } else {
        setError('Failed to load foundations');
      }
      setIsLoading(false);
    });
  }, [animation.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFoundationId) return;

    setIsSaving(true);
    setError(null);

    try {
      // Get the next slot
      const progRes = await getWithRetry<{ progressions: { id: string }[] }>(`/api/animations/${selectedFoundationId}/progressions`);
      if (!progRes.ok || !progRes.data) {
        throw new Error('Failed to get progression count');
      }
      const nextSlot = progRes.data.progressions.length + 1;

      if (nextSlot > 5) {
        throw new Error('This foundation already has 5 progressions');
      }

      // Link the animation
      const updateRes = await fetchWithRetry(`/api/animations/${animation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parent_animation_id: selectedFoundationId,
          is_progression: true,
          progression_order: nextSlot
        }),
      });

      if (!updateRes.ok) {
        throw new Error('Failed to link animation');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsSaving(false);
    }
  };

  const hasProgressions = (animation.progression_count ?? 0) > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-primary/60" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-surface border border-border mx-4">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-heading font-semibold text-text-primary">
              Link to Foundation
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 hover:bg-surface-warm transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {hasProgressions && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Warning:</strong> This animation has its own progressions. Linking it will detach them.
              </span>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-text-primary mb-2">
              Select Foundation Animation
            </label>
            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-text-primary/70">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading foundations...
              </div>
            ) : foundations.length === 0 ? (
              <div className="text-sm text-text-primary/70 p-3 bg-surface-warm border border-border">
                No eligible foundations found.
              </div>
            ) : (
              <select
                value={selectedFoundationId}
                onChange={(e) => setSelectedFoundationId(e.target.value)}
                className="w-full px-3 py-2 border border-border bg-surface focus:border-primary focus:outline-none"
                required
              >
                <option value="" disabled>Select a foundation...</option>
                {foundations.map(f => (
                  <option key={f.id} value={f.id} disabled={(f.progression_count || 0) >= 5}>
                    {f.title} {(f.progression_count || 0) >= 5 ? '(full)' : `(${f.progression_count || 0}/5)`}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border text-text-primary font-medium hover:bg-surface-warm transition-colors"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedFoundationId || isSaving || isLoading}
              className="flex-1 px-4 py-2 bg-primary text-text-inverse font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Linking...
                </span>
              ) : (
                'Link Animation'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
