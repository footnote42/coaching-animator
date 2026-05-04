'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Loader2, Cloud, AlertCircle } from 'lucide-react';
import { AnimationType, Visibility } from '@/lib/schemas/animations';
import { postWithRetry, putWithRetry, getWithRetry } from '@/lib/api-client';
import { toast } from 'sonner';
import { offlineQueue } from '@/lib/offline-queue';
import { getFriendlyErrorMessage } from '@/lib/error-messages';

interface SaveToCloudModalProps {
  projectName: string;
  payload: unknown;
  videoUrl?: string;
  onClose: () => void;
  onSuccess: (id: string) => void;
  initialCoachingNotes?: string;
  initialParentId?: string | null;
  isEditMode?: boolean;
  animationId?: string | null;
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

export function SaveToCloudModal({ 
  projectName, 
  payload, 
  videoUrl, 
  onClose, 
  onSuccess, 
  initialCoachingNotes, 
  initialParentId,
  isEditMode = false,
  animationId = null
}: SaveToCloudModalProps) {
  const [title, setTitle] = useState(projectName || 'Untitled Animation');
  const [description, setDescription] = useState('');
  const [coachingNotes, setCoachingNotes] = useState(initialCoachingNotes || '');
  const [animationType, setAnimationType] = useState<AnimationType>('tactic');
  const [visibility, setVisibility] = useState<Visibility>('private');
  const [tags, setTags] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [saveMode, setSaveMode] = useState<'new' | 'overwrite'>(isEditMode ? 'overwrite' : 'new');
  const [isMajorVersion, setIsMajorVersion] = useState(false);
  const isMountedRef = useRef(true);

  // Phase 2: Progressions
  const [isProgression, setIsProgression] = useState(!!initialParentId);
  const [selectedFoundationId, setSelectedFoundationId] = useState<string>(initialParentId || '');
  const [foundations, setFoundations] = useState<{ id: string; title: string; progression_count: number; tags?: string[]; animation_type?: AnimationType }[]>([]);
  const [progressionOrder, setProgressionOrder] = useState<number | null>(null);

  useEffect(() => {
    if (isProgression && foundations.length === 0) {
      getWithRetry<{ animations: { id: string; title: string; progression_count: number; tags?: string[]; animation_type?: AnimationType }[] }>('/api/animations?is_progression=false&limit=100').then((res) => {
        if (res.ok && res.data) {
          setFoundations(res.data.animations);
        }
      });
    }
  }, [isProgression, foundations.length]);

  useEffect(() => {
    if (isProgression && selectedFoundationId && foundations.length > 0) {
      getWithRetry<{ id: string }[]>(`/api/animations/${selectedFoundationId}/progressions`).then((res) => {
        if (res.ok && res.data) {
          const nextSlot = res.data.length + 1;
          setProgressionOrder(nextSlot);
          const foundation = foundations.find(f => f.id === selectedFoundationId);
          if (foundation) {
             setTitle(`${foundation.title} — Progression ${nextSlot}`);
             if (foundation.tags?.length && !tags) setTags(foundation.tags.join(', '));
             if (foundation.animation_type) setAnimationType(foundation.animation_type);
          }
        }
      });
    }
  }, [isProgression, selectedFoundationId, foundations, tags]);

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
        coaching_notes: coachingNotes.trim() || undefined,
        animation_type: animationType,
        visibility,
        tags: tagArray.length > 0 ? tagArray : undefined,
        video_url: videoUrl || undefined,
        payload,
        ...(isProgression && selectedFoundationId ? {
          parent_animation_id: selectedFoundationId,
          is_progression: true,
          progression_order: progressionOrder || 1,
        } : {
          is_progression: false,
          parent_animation_id: undefined,
          progression_order: 0,
        })
      };

      // Quick synchronous check - if offline, queue immediately
      if (!navigator.onLine) {
        const offlineId = offlineQueue.addItem({
          type: saveMode === 'overwrite' ? 'update' : 'create',
          endpoint: saveMode === 'overwrite' ? `/api/animations/${animationId}` : '/api/animations',
          method: saveMode === 'overwrite' ? 'PUT' : 'POST',
          payload: saveMode === 'overwrite' ? { ...requestBody, is_major_version: isMajorVersion } : requestBody
        });

        onSuccess(saveMode === 'overwrite' ? (animationId || 'pending') : offlineId);
        return;
      }

      // Let postWithRetry/putWithRetry handle the request with retries
      if (saveMode === 'overwrite' && animationId) {
        const result = await putWithRetry<{ id: string }>(
          `/api/animations/${animationId}`,
          { ...requestBody, is_major_version: isMajorVersion },
          {
            onRetry: (attempt) => {
              if (isMountedRef.current) setRetryAttempt(attempt);
            }
          }
        );
 
        if (!result.ok) {
          if (result.status >= 400 && result.status < 500) {
            setError(result.error || 'Failed to update animation');
            return;
          }
          throw new Error(result.error || 'Failed to update animation');
        }
        toast.success('Animation updated successfully');
        onSuccess(animationId);
      } else {
        // Create new animation (POST)
        const result = await postWithRetry<{ id: string }>(
          '/api/animations',
          requestBody,
          {
            onRetry: (attempt) => {
              if (isMountedRef.current) setRetryAttempt(attempt);
            }
          }
        );
 
        if (!result.ok || !result.data) {
          if (result.status >= 400 && result.status < 500) {
            setError(result.error || 'Failed to save animation');
            return;
          }
          throw new Error(result.error || 'Failed to save animation');
        }
        toast.success('Animation saved to cloud');
        onSuccess(result.data.id);
      }
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
            coaching_notes: coachingNotes.trim() || null,
            animation_type: animationType,
            visibility,
            tags: tagArray.length > 0 ? tagArray : undefined,
            video_url: videoUrl || undefined,
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
        className="absolute inset-0 bg-primary/60"
        onClick={onClose}
      />

      {/* Modal */}
      <div 
        role="dialog"
        aria-modal="true"
        data-testid="save-to-cloud-modal"
        className="relative w-full max-w-lg bg-surface border border-border mx-4 max-h-[90vh] overflow-y-auto"
      >
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
            className="p-2.5 hover:bg-surface-warm transition-colors"
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

          {isEditMode && (
            <div className="mb-6 p-4 bg-primary/5 border border-primary/20">
              <h3 className="text-sm font-semibold text-primary mb-3 uppercase tracking-wider">Save Options</h3>
              <div className="space-y-3">
                <label htmlFor="save-mode-overwrite" className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    id="save-mode-overwrite"
                    name="saveMode"
                    value="overwrite"
                    checked={saveMode === 'overwrite'}
                    onChange={() => setSaveMode('overwrite')}
                    className="mt-1"
                  />
                  <div>
                    <span className="block text-sm font-medium text-text-primary">Overwrite Original</span>
                    <span className="block text-xs text-text-primary/60">This will update the existing animation and create a new version record.</span>
                  </div>
                </label>

                {saveMode === 'overwrite' && (
                  <label className="flex items-center gap-2 ml-7 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isMajorVersion}
                      onChange={(e) => setIsMajorVersion(e.target.checked)}
                      className="w-4 h-4 rounded-none border-border text-primary focus:ring-primary"
                    />
                    <span className="text-xs font-medium text-text-primary">Mark as Major Version (e.g. 1.0 → 2.0)</span>
                  </label>
                )}

                <label htmlFor="save-mode-new" className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    id="save-mode-new"
                    name="saveMode"
                    value="new"
                    checked={saveMode === 'new'}
                    onChange={() => setSaveMode('new')}
                    className="mt-1"
                  />
                  <div>
                    <span className="block text-sm font-medium text-text-primary">Save as New Copy</span>
                    <span className="block text-xs text-text-primary/60">Creates a completely separate animation record in your playbook.</span>
                  </div>
                </label>
              </div>

              {saveMode === 'overwrite' && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs flex gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Warning: Overwriting will update all existing share links to show these new frames.</span>
                </div>
              )}
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

          {/* Coaching Notes */}
          <div className="mb-4">
            <label htmlFor="save-coaching-notes" className="block text-sm font-medium text-text-primary mb-1">
              Coaching Notes
            </label>
            <textarea
              id="save-coaching-notes"
              value={coachingNotes}
              onChange={(e) => setCoachingNotes(e.target.value)}
              className="w-full px-3 py-2 border border-border bg-surface focus:border-primary focus:outline-none resize-none"
              rows={3}
              maxLength={5000}
              placeholder="Add delivery notes for coaches (optional)"
            />
            <p className="text-xs text-text-primary/50 mt-1">{coachingNotes.length}/5000 characters</p>
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

          {/* Save As Progression Toggle */}
          <div className="mb-6">
            <label className="flex items-center gap-2 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={isProgression}
                onChange={(e) => setIsProgression(e.target.checked)}
                className="w-4 h-4 rounded-none border-border text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-text-primary">Save as Progression</span>
            </label>
            
            {isProgression && (
              <div className="mt-3 p-4 bg-surface-warm border border-border">
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Foundation Animation
                </label>
                <select
                  value={selectedFoundationId}
                  onChange={(e) => setSelectedFoundationId(e.target.value)}
                  className="w-full px-3 py-2 border border-border bg-surface focus:border-primary focus:outline-none"
                  required={isProgression}
                >
                  <option value="" disabled>Select a foundation...</option>
                  {foundations.map(f => (
                    <option key={f.id} value={f.id} disabled={(f.progression_count || 0) >= 5}>
                      {f.title} {(f.progression_count || 0) >= 5 ? '(full)' : `(${f.progression_count || 0}/5)`}
                    </option>
                  ))}
                </select>
              </div>
            )}
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
