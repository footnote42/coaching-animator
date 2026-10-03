'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/shared/ui/button';
import { useUser } from '@/lib/contexts/UserContext';
import { MyPracticesList, type Visibility } from './MyPracticesList';
import { TagPicker } from './TagPicker';

interface Props {
  /** Current script text from the Import box; saved as-is. */
  scriptText: string;
  /** Id of the opened Practice: saving updates it. Null saves a new Practice. */
  practiceId: string | null;
  title: string;
  description: string;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  sourceUrl: string;
  sourceTitle: string;
  onSourceUrlChange: (url: string) => void;
  onSourceTitleChange: (title: string) => void;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  /** Called with the Practice's id after a successful save. */
  onSaved: (id: string) => void;
  onOpen: (id: string) => void;
  /** Hide the library list on mobile (since it takes a lot of space) */
  hideListOnMobile?: boolean;
}

/** Enter in a single-line field must never submit or trigger anything. */
const blockEnter = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter') e.preventDefault();
};

/** Save form and "My Practices" list. Guests see a sign-in prompt instead. */
export function PracticeLibrary({
  scriptText,
  practiceId,
  title,
  description,
  tags,
  onTagsChange,
  sourceUrl,
  sourceTitle,
  onSourceUrlChange,
  onSourceTitleChange,
  onTitleChange,
  onDescriptionChange,
  onSaved,
  onOpen,
  hideListOnMobile,
}: Props) {
  const { user, loading } = useUser();
  const [visibility, setVisibility] = useState<Visibility>('private');
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  if (loading) return null;
  if (!user) {
    return (
      <p className="text-sm text-text-primary">
        <Link href="/login?redirect=/practice" className="underline">Sign in</Link> to save Practices and see My Practices.
      </p>
    );
  }

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
      setRefreshKey((n) => n + 1);
    } else {
      const body = await res?.json().catch(() => null);
      const details: string[] = body?.error?.details ?? [];
      toast.error([body?.error?.message ?? 'Could not save.', ...details].join(' '));
    }
  };

  const field =
    'border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-text-primary">
          {practiceId ? 'Update this Practice' : 'Save this Practice'}
        </h2>
        <input
          aria-label="Title"
          placeholder="Title"
          maxLength={100}
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          onKeyDown={blockEnter}
          className={field}
        />
        <textarea
          aria-label="Description"
          placeholder="Description (optional)"
          maxLength={2000}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className={`${field} h-16 resize-none`}
        />
        <TagPicker value={tags} onChange={onTagsChange} />
        <input
          aria-label="Source link"
          type="url"
          placeholder="Source link, https only (optional)"
          maxLength={2000}
          value={sourceUrl}
          onChange={(e) => onSourceUrlChange(e.target.value)}
          onKeyDown={blockEnter}
          className={field}
        />
        <input
          aria-label="Source title"
          placeholder="Source title (optional)"
          maxLength={200}
          value={sourceTitle}
          onChange={(e) => onSourceTitleChange(e.target.value)}
          onKeyDown={blockEnter}
          className={field}
        />
        {!practiceId && (
          <select
            aria-label="Visibility"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as Visibility)}
            className={field}
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
        <Button onClick={save} disabled={saving || !title.trim() || !scriptText.trim()}>
          {practiceId ? 'Save changes' : 'Save'}
        </Button>
      </div>

      <div className={hideListOnMobile ? 'hidden md:block' : undefined}>
        <h2 className="mb-1 text-sm font-medium text-text-primary">My Practices</h2>
        <MyPracticesList refreshKey={refreshKey} onOpen={onOpen} />
      </div>
    </div>
  );
}
