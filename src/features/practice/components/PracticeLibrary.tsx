'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/shared/ui/button';
import { useUser } from '@/lib/contexts/UserContext';

interface PracticeSummary {
  id: string;
  title: string;
  visibility: 'private' | 'link' | 'public';
}

interface Props {
  /** Current script text from the Import box; saved as-is. */
  scriptText: string;
  onOpen: (id: string) => void;
}

/** Save form and "My Practices" list. Guests see a sign-in prompt instead. */
export function PracticeLibrary({ scriptText, onOpen }: Props) {
  const { user, loading } = useUser();
  const [practices, setPractices] = useState<PracticeSummary[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<PracticeSummary['visibility']>('private');
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch('/api/practices');
    if (res.ok) setPractices((await res.json()).practices);
  }, []);

  useEffect(() => {
    if (user) void refresh();
  }, [user, refresh]);

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
      setMessage('Paste a valid script before saving.');
      return;
    }
    setSaving(true);
    setMessage(null);
    const res = await fetch('/api/practices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description: description || null, visibility, script }),
    });
    setSaving(false);
    if (res.ok) {
      setMessage('Saved.');
      void refresh();
    } else {
      const body = await res.json().catch(() => null);
      const details: string[] = body?.error?.details ?? [];
      setMessage([body?.error?.message ?? 'Could not save.', ...details].join(' '));
    }
  };

  const remove = async (id: string) => {
    const res = await fetch(`/api/practices/${id}`, { method: 'DELETE' });
    if (res.ok) setPractices((list) => list.filter((p) => p.id !== id));
  };

  const changeVisibility = async (id: string, next: PracticeSummary['visibility']) => {
    setPublishing(null);
    const res = await fetch(`/api/practices/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visibility: next }),
    });
    if (res.ok) {
      setPractices((list) => list.map((p) => (p.id === id ? { ...p, visibility: next } : p)));
    } else {
      setMessage('Could not change visibility.');
    }
  };

  const pickVisibility = (id: string, next: PracticeSummary['visibility']) => {
    if (next === 'public') setPublishing(id);
    else void changeVisibility(id, next);
  };

  const field =
    'border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-text-primary">Save this Practice</h2>
        <input
          aria-label="Title"
          placeholder="Title"
          maxLength={100}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={field}
        />
        <textarea
          aria-label="Description"
          placeholder="Description (optional)"
          maxLength={2000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${field} h-16 resize-none`}
        />
        <select
          aria-label="Visibility"
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as PracticeSummary['visibility'])}
          className={field}
        >
          <option value="private">Private</option>
          <option value="link">Anyone with the link</option>
          <option value="public">Public</option>
        </select>
        {visibility === 'public' && (
          <p className="text-xs text-text-primary">
            Public Practices appear in Explore. Please do not name or identify players.
          </p>
        )}
        <Button onClick={save} disabled={saving || !title.trim() || !scriptText.trim()}>
          Save
        </Button>
        {message && <p role="status" className="text-sm text-text-primary">{message}</p>}
      </div>

      <div>
        <h2 className="mb-1 text-sm font-medium text-text-primary">My Practices</h2>
        {practices.length === 0 ? (
          <p className="text-sm text-text-primary">Nothing saved yet.</p>
        ) : (
          <ul className="space-y-1">
            {practices.map((p) => (
              <li key={p.id} className="flex items-center gap-2 text-sm">
                <button type="button" onClick={() => onOpen(p.id)} className="flex-1 truncate text-left underline">
                  {p.title}
                </button>
                <select
                  aria-label={`Visibility of ${p.title}`}
                  value={p.visibility}
                  onChange={(e) => pickVisibility(p.id, e.target.value as PracticeSummary['visibility'])}
                  className="border border-[var(--color-border)] bg-[var(--color-surface)] p-1 text-xs"
                >
                  <option value="private">Private</option>
                  <option value="link">Anyone with the link</option>
                  <option value="public">Public</option>
                </select>
                <Button variant="outline" size="sm" onClick={() => remove(p.id)} aria-label={`Delete ${p.title}`}>
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {publishing && (
        <div role="dialog" aria-labelledby="publish-title" className="border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm">
          <h3 id="publish-title" className="font-medium text-text-primary">Publish to Explore</h3>
          <p className="my-2 text-text-primary">
            Anyone will be able to find this Practice. Please do not name or identify players in the title,
            description or commentary.
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => changeVisibility(publishing, 'public')}>Publish</Button>
            <Button size="sm" variant="outline" onClick={() => setPublishing(null)}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
}
