'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Loader2, Cloud, AlertCircle } from 'lucide-react';
import { AnimationType, Visibility } from '@/lib/schemas/animations';
import { postWithRetry } from '@/lib/api-client';
import { offlineQueue } from '@/lib/offline-queue';
import { getFriendlyErrorMessage } from '@/lib/error-messages';

interface SaveToCloudModalProps {
  projectName: string;
  payload: unknown;
  onClose: () => void;
  onSuccess: (id: string) => void;
}

const ANIMATION_TYPES: { value: AnimationType; label: string; description: string }[] = [
  { value: 'tactic', label: 'Tactic', description: 'Set plays and tactical movements' },
  { value: 'skill', label: 'Skill', description: 'Technical drills and exercises' },
  { value: 'game', label: 'Game', description: 'Match situations and scenarios' },
  { value: 'other', label: 'Other', description: 'Other animation types' },
];

const VISIBILITY_OPTIONS: { value: Visibility; label: string; description: string }[] = [
  { value: 'private', label: 'Private', description: 'Only you can see this animation' },
  { value: 'link_shared', label: 'Link Only', description: 'Anyone with the link can view' },
  { value: 'public', label: 'Public', description: 'Visible in the public gallery' },
];

export function SaveToCloudModal({ projectName, payload, onClose, onSuccess }: SaveToCloudModalProps) {
  const [title, setTitle] = useState(projectName || 'Untitled Animation');
  const [description, setDescription] = useState('');
  const [animationType, setAnimationType] = useState<AnimationType>('tactic');
  const [visibility, setVisibility] = useState<Visibility>('private');
  const [tags, setTags] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const isMountedRef = useRef(true);

  // Cleanup to prevent state updates after unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const tagArray = tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0)
        .slice(0, 10);

      const requestBody = {
        title: title.trim(),
        description: description.trim() || undefined,
        animation_type: animationType,
        visibility,
        tags: tagArray.length > 0 ? tagArray : undefined,
        payload,
      };

      // Quick synchronous check - if offline, queue immediately
      if (!navigator.onLine) {
        const offlineId = offlineQueue.addItem({
          type: 'create',
          endpoint: '/api/animations',
          method: 'POST',
          payload: requestBody
        });

        onSuccess(offlineId);
        return;
      }

      // Let postWithRetry handle the request with retries
      // (removed async health check to allow retries to work)
      const result = await postWithRetry<{ id: string }>(
        '/api/animations',
        requestBody,
        {
          onRetry: (attempt, _max) => {
            // Only update state if component is still mounted
            if (isMountedRef.current) {
              setRetryAttempt(attempt);
            }
          }
        }
      );

      if (!result.ok || !result.data) {
        // If it was a network error (status 0) or server error (5xx), queue it
        if (result.status === 0 || result.status >= 500) {
          const offlineId = offlineQueue.addItem({
            type: 'create',
            endpoint: '/api/animations',
            method: 'POST',
            payload: requestBody
          });
          onSuccess(offlineId);
          return;
        }

        throw new Error(result.error || 'Failed to save animation');
      }

      onSuccess(result.data.id);
    } catch (err) {
      if (err instanceof Error && (err.message.includes('Network') || err.message.includes('fetch'))) {
        // Catch-all for network errors thrown by fetchWithRetry if we didn't catch them above
        const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
        const offlineId = offlineQueue.addItem({
          type: 'create',
          endpoint: '/api/animations',
          method: 'POST',
          payload: {
            title: title.trim(),
            description: description.trim() || undefined,
            animation_type: animationType,
            visibility,
            tags: tagArray.length > 0 ? tagArray : undefined,
            payload,
          }
        });
        onSuccess(offlineId);
        return;
      }
      setError(getFriendlyErrorMessage(err));
    } finally {
      setIsSaving(false);
      // Reset retry attempt counter
      if (isMountedRef.current) {
        setRetryAttempt(0);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-surface border border-border mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-surface">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-heading font-semibold text-text-primary">
              Save to Cloud
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-surface-warm transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div className="mb-4">
            <label htmlFor="save-title" className="block text-sm font-medium text-text-primary mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="save-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-border bg-surface focus:border-primary focus:outline-none"
              maxLength={100}
              placeholder="Enter a title for your animation"
              required
            />
            <p className="text-xs text-text-primary/50 mt-1">{title.length}/100 characters</p>
          </div>

          {/* Description */}
          <div className="mb-4">
            <label htmlFor="save-description" className="block text-sm font-medium text-text-primary mb-1">
              Description
            </label>
            <textarea
              id="save-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-border bg-surface focus:border-primary focus:outline-none resize-none"
              rows={3}
              maxLength={2000}
              placeholder="Describe your animation (optional)"
            />
            <p className="text-xs text-text-primary/50 mt-1">{description.length}/2000 characters</p>
          </div>

          {/* Animation Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-primary mb-2">
              Animation Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ANIMATION_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setAnimationType(type.value)}
                  className={`p-3 text-left transition-colors border ${animationType === type.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                    }`}
                >
                  <div className="font-medium text-sm text-text-primary">{type.label}</div>
                  <div className="text-xs text-text-primary/60">{type.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="mb-4">
            <label htmlFor="save-tags" className="block text-sm font-medium text-text-primary mb-1">
              Tags
            </label>
            <input
              type="text"
              id="save-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 border border-border bg-surface focus:border-primary focus:outline-none"
              placeholder="lineout, scrum, backs (comma-separated)"
            />
            <p className="text-xs text-text-primary/50 mt-1">Up to 10 tags, separated by commas</p>
          </div>

          {/* Visibility */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-text-primary mb-2">
              Visibility
            </label>
            <div className="space-y-2">
              {VISIBILITY_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-start p-3 cursor-pointer border transition-colors ${visibility === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                    }`}
                >
                  <input
                    type="radio"
                    name="visibility"
                    value={option.value}
                    checked={visibility === option.value}
                    onChange={() => setVisibility(option.value)}
                    className="mt-0.5 mr-3"
                  />
                  <div>
                    <div className="font-medium text-text-primary">{option.label}</div>
                    <div className="text-xs text-text-primary/70">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
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
              className="flex-1 px-4 py-2 bg-primary text-text-inverse font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              disabled={isSaving}
            >
              {isSaving ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {retryAttempt > 0 ? `Retrying... (${retryAttempt}/3)` : 'Saving...'}
                </span>
              ) : (
                <span className="inline-flex items-center justify-center gap-2">
                  <Cloud className="w-4 h-4" />
                  Save to Cloud
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
