'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/shared/ui/button';

export type Visibility = 'private' | 'link' | 'public';

interface PracticeSummary {
  id: string;
  title: string;
  visibility: Visibility;
}

interface Props {
  /** Change this to refetch the list, e.g. after a save. */
  refreshKey?: number;
  /** Open a Practice in place. Without it, each title links to the editor. */
  onOpen?: (id: string) => void;
}

/**
 * The signed-in Coach's Practices, with visibility and delete. Used inside the
 * editor and on its own on /my-practices. Callers check sign-in first.
 */
export function MyPracticesList({ refreshKey = 0, onOpen }: Props) {
  const [practices, setPractices] = useState<PracticeSummary[] | null>(null);
  const [publishing, setPublishing] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch('/api/practices').catch(() => null);
    if (res?.ok) setPractices((await res.json()).practices);
    else setPractices((list) => list ?? []);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh, refreshKey]);

  const remove = async (id: string) => {
    const res = await fetch(`/api/practices/${id}`, { method: 'DELETE' });
    if (res.ok) setPractices((list) => (list ?? []).filter((p) => p.id !== id));
    else toast.error('Could not delete that Practice.');
  };

  const changeVisibility = async (id: string, next: Visibility) => {
    setPublishing(null);
    const res = await fetch(`/api/practices/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visibility: next }),
    });
    if (res.ok) {
      setPractices((list) => (list ?? []).map((p) => (p.id === id ? { ...p, visibility: next } : p)));
    } else {
      toast.error('Could not change visibility.');
    }
  };

  const pickVisibility = (id: string, next: Visibility) => {
    if (next === 'public') setPublishing(id);
    else void changeVisibility(id, next);
  };

  if (practices === null) return <p role="status" className="text-sm text-text-primary">Loading...</p>;

  return (
    <div className="flex flex-col gap-3">
      {practices.length === 0 ? (
        <p className="text-sm text-text-primary">Nothing saved yet.</p>
      ) : (
        <ul className="space-y-1">
          {practices.map((p) => (
            <li key={p.id} className="flex items-center gap-2 text-sm">
              {onOpen ? (
                <button type="button" onClick={() => onOpen(p.id)} className="flex-1 truncate text-left underline">
                  {p.title}
                </button>
              ) : (
                <Link href={`/practice?id=${p.id}`} className="flex-1 truncate underline">
                  {p.title}
                </Link>
              )}
              <select
                aria-label={`Visibility of ${p.title}`}
                value={p.visibility}
                onChange={(e) => pickVisibility(p.id, e.target.value as Visibility)}
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

      {publishing && (
        <div role="dialog" aria-labelledby="publish-title" className="border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm">
          <h3 id="publish-title" className="font-medium text-text-primary">Publish to the Gallery</h3>
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
