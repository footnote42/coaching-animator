'use client';

import { useState, type Ref } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import type { Visibility } from './MyPracticesList';
import { TagPicker } from './TagPicker';

interface SaveInput {
  /** Current script text from the Import box; saved as-is. */
  scriptText: string;
  /** Id of the opened Practice: saving updates it. Null saves a new Practice. */
  practiceId: string | null;
  title: string;
  description: string;
  tags: string[];
  sourceUrl: string;
  sourceTitle: string;
  /** Called with the Practice's id after a successful save. */
  onSaved: (id: string) => void;
}

/** Saving a Practice: the request, its busy state, the new Practice's Visibility and a key to refresh My Practices. */
export function usePracticeSave({ scriptText, practiceId, title, description, tags, sourceUrl, sourceTitle, onSaved }: SaveInput) {
  const [visibility, setVisibility] = useState<Visibility>('private');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    let script: unknown;
    try {
      script = JSON.parse(scriptText);
    } catch {
      toast.error('Fix the script before saving.');
      return;
    }
    const source = { sourceUrl: sourceUrl.trim() || null, sourceTitle: sourceTitle.trim() || null };
    setSaving(true);
    const res = await fetch(practiceId ? `/api/practices/${practiceId}` : '/api/practices', {
      method: practiceId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        practiceId
          ? { title, description: description || null, tags, ...source, script }
          : { title, description: description || null, visibility, tags, ...source, script },
      ),
    }).catch(() => null);
    setSaving(false);
    if (res?.ok) {
      const body = await res.json().catch(() => null);
      toast.success(practiceId ? 'Practice updated.' : 'Practice saved.');
      const id: string | undefined = body?.practice?.id ?? practiceId ?? undefined;
      if (id) onSaved(id);
    } else {
      const body = await res?.json().catch(() => null);
      const details: string[] = body?.error?.details ?? [];
      toast.error([body?.error?.message ?? 'Could not save.', ...details].join(' '));
    }
  };

  return { save, saving, visibility, setVisibility };
}

/** Enter in a single-line field must never submit or trigger anything. */
const blockEnter = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter') e.preventDefault();
};

const FIELD =
  'min-h-11 border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';

interface DetailsProps {
  practiceId: string | null;
  title: string;
  description: string;
  tags: string[];
  sourceUrl: string;
  sourceTitle: string;
  visibility: Visibility;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onTagsChange: (tags: string[]) => void;
  onSourceUrlChange: (url: string) => void;
  onSourceTitleChange: (title: string) => void;
  onVisibilityChange: (visibility: Visibility) => void;
  titleRef?: Ref<HTMLInputElement>;
}

/** The Practice's details: Title, Description, Tags, Source and (for a new Practice) Visibility. */
export function PracticeDetails({
  practiceId,
  title,
  description,
  tags,
  sourceUrl,
  sourceTitle,
  visibility,
  onTitleChange,
  onDescriptionChange,
  onTagsChange,
  onSourceUrlChange,
  onSourceTitleChange,
  onVisibilityChange,
  titleRef,
}: DetailsProps) {
  return (
    <div className="flex flex-col gap-2">
      <input
        ref={titleRef}
        aria-label="Title"
        placeholder="Title"
        maxLength={100}
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        onKeyDown={blockEnter}
        className={FIELD}
      />
      <textarea
        aria-label="Description"
        placeholder="Description (optional)"
        maxLength={2000}
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        className={`${FIELD} h-16 resize-none`}
      />
      <input
        aria-label="Source link"
        type="url"
        placeholder="Source link, https only (optional)"
        maxLength={2000}
        value={sourceUrl}
        onChange={(e) => onSourceUrlChange(e.target.value)}
        onKeyDown={blockEnter}
        className={FIELD}
      />
      <input
        aria-label="Source title"
        placeholder="Source title (optional)"
        maxLength={200}
        value={sourceTitle}
        onChange={(e) => onSourceTitleChange(e.target.value)}
        onKeyDown={blockEnter}
        className={FIELD}
      />
      {!practiceId && (
        <select
          aria-label="Visibility"
          value={visibility}
          onChange={(e) => onVisibilityChange(e.target.value as Visibility)}
          className={FIELD}
        >
          <option value="private">Private</option>
          <option value="link">Anyone with the link</option>
          <option value="public">Public</option>
        </select>
      )}
      {!practiceId && visibility === 'public' && (
        <p className="text-xs text-text-primary">
          Public Practices appear in the Gallery. Please do not name or identify players.
        </p>
      )}
      <div className="mt-1">
        <TagPicker value={tags} onChange={onTagsChange} />
      </div>
    </div>
  );
}

/** The signed-out prompt in place of saving. */
export function SignInToSave() {
  return (
    <p className="text-sm text-text-primary">
      <Link href="/login?redirect=/practice" className="underline">Sign in</Link> to save Practices and see My Practices.
    </p>
  );
}
