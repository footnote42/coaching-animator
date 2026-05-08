'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AnimationType, Visibility } from '@/lib/schemas/animations';
import { AnimationSummary } from '@/features/gallery/components/AnimationCard';

interface EditMetadataModalProps {
  animation: AnimationSummary;
  onClose: () => void;
  onSave: (updated: Partial<AnimationSummary>) => void;
}

const YOUTUBE_URL_REGEX = /^https:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[A-Za-z0-9_-]{11}$/;

const ANIMATION_TYPES: { value: AnimationType; label: string }[] = [
  { value: 'tactic', label: 'Tactic' },
  { value: 'skill', label: 'Skill' },
  { value: 'game', label: 'Game' },
  { value: 'other', label: 'Other' },
];

const VISIBILITY_OPTIONS: { value: Visibility; label: string; description: string }[] = [
  { value: 'private', label: 'Private', description: 'Only you can see this' },
  { value: 'link_shared', label: 'Link Only', description: 'Anyone with the link can view' },
  { value: 'public', label: 'Public', description: 'Visible in public gallery' },
];

export function EditMetadataModal({ animation, onClose, onSave }: EditMetadataModalProps) {
  const [title, setTitle] = useState(animation.title);
  const [description, setDescription] = useState(animation.description || '');
  const [coachingNotes, setCoachingNotes] = useState(animation.coaching_notes || '');
  const [tagsInput, setTagsInput] = useState((animation.tags ?? []).join(', '));
  const [tagsError, setTagsError] = useState<string | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState(animation.video_url || '');
  const [youtubeError, setYoutubeError] = useState<string | null>(null);
  const [animationType, setAnimationType] = useState<AnimationType>(animation.animation_type);
  const [visibility, setVisibility] = useState<Visibility>(animation.visibility);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setTagsError(null);
    setYoutubeError(null);

    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    const parsedTags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    if (parsedTags.length > 10) {
      setTagsError('Maximum 10 tags allowed');
      return;
    }
    if (parsedTags.some(t => t.length > 30)) {
      setTagsError('Tags cannot exceed 30 characters each');
      return;
    }

    if (youtubeUrl.trim() && !YOUTUBE_URL_REGEX.test(youtubeUrl.trim())) {
      setYoutubeError('Please enter a valid YouTube URL (youtube.com/watch?v=... or youtu.be/...)');
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/animations/${animation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          coaching_notes: coachingNotes.trim() || undefined,
          animation_type: animationType,
          visibility,
          tags: parsedTags.length > 0 ? parsedTags : undefined,
          video_url: youtubeUrl.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Failed to update');
      }

      onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        coaching_notes: coachingNotes.trim() || undefined,
        animation_type: animationType,
        visibility,
        tags: parsedTags.length > 0 ? parsedTags : null,
        video_url: youtubeUrl.trim() || null,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSaving(false);
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
      <div role="dialog" aria-modal="true" aria-label="Edit Animation" data-testid="edit-metadata-modal" className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-surface border border-border mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-heading font-semibold text-text-primary">
            Edit Animation
          </h2>
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

          {/* Title */}
          <div className="mb-4">
            <label htmlFor="animation-title" className="block text-sm font-medium text-text-primary mb-1">
              Title
            </label>
            <input
              type="text"
              id="animation-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-border bg-surface focus:border-primary focus:outline-none"
              maxLength={100}
              placeholder="Enter animation title"
              required
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label htmlFor="animation-description" className="block text-sm font-medium text-text-primary mb-1">
              Description
            </label>
            <textarea
              id="animation-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-border bg-surface focus:border-primary focus:outline-none resize-none"
              maxLength={2000}
              rows={3}
              placeholder="Optional description for your animation"
            />
            <p className="mt-1 text-xs text-text-primary/60">{description.length}/2000 characters</p>
          </div>

          {/* Coaching Notes */}
          <div className="mb-4">
            <label htmlFor="animation-coaching-notes" className="block text-sm font-medium text-text-primary mb-1">
              Coaching Notes
            </label>
            <textarea
              id="animation-coaching-notes"
              value={coachingNotes}
              onChange={(e) => setCoachingNotes(e.target.value)}
              className="w-full px-3 py-2 border border-border bg-surface focus:border-primary focus:outline-none resize-none"
              maxLength={5000}
              rows={3}
              placeholder="Add delivery notes for coaches (optional)"
            />
            <p className="mt-1 text-xs text-text-primary/60">{coachingNotes.length}/5000 characters</p>
          </div>

          {/* Tags */}
          <div className="mb-4">
            <label htmlFor="animation-tags" className="block text-sm font-medium text-text-primary mb-1">
              Tags
            </label>
            <input
              type="text"
              id="animation-tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-3 py-2 border border-border bg-surface focus:border-primary focus:outline-none"
              placeholder="Up to 10 tags, comma-separated"
            />
            {tagsError && <p className="mt-1 text-sm text-red-600">{tagsError}</p>}
            <p className="mt-1 text-xs text-text-primary/60">{tagsInput.split(',').filter(t => t.trim()).length}/10 tags</p>
          </div>

          {/* YouTube URL */}
          <div className="mb-4">
            <label htmlFor="animation-youtube" className="block text-sm font-medium text-text-primary mb-1">
              YouTube URL
            </label>
            <input
              type="text"
              id="animation-youtube"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              className="w-full px-3 py-2 border border-border bg-surface focus:border-primary focus:outline-none"
              placeholder="Optional YouTube link for this drill"
            />
            {youtubeError && <p className="mt-1 text-sm text-red-600">{youtubeError}</p>}
          </div>

          {/* Animation Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-primary mb-1">
              Type
            </label>
            <div className="flex gap-2">
              {ANIMATION_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setAnimationType(type.value)}
                  className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                    animationType === type.value
                      ? 'bg-primary text-text-inverse'
                      : 'bg-surface border border-border hover:border-primary'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
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
                  className={`flex items-start p-3 cursor-pointer border transition-colors ${
                    visibility === option.value
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
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
