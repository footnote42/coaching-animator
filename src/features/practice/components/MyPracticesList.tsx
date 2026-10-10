'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/ui/button';
import { sharePracticeLink } from '@/shared/share';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';

/** Shared by every control in a card's action row: one height, one type size, one width rule. */
const ACTION = 'h-11 min-h-[44px] w-full px-3 text-sm sm:w-auto sm:px-4';

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
  const [deletingPractice, setDeletingPractice] = useState<PracticeSummary | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch('/api/practices').catch(() => null);
    if (res?.ok) setPractices((await res.json()).practices);
    else setPractices((list) => list ?? []);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh, refreshKey]);

  const remove = async (id: string) => {
    setDeletingPractice(null);
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

  const share = async (p: PracticeSummary) => {
    if (p.visibility === 'private') {
      // One tap: make it link-shared, then copy the link (#194).
      const res = await fetch(`/api/practices/${p.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibility: 'link' }),
      });
      if (!res.ok) {
        toast.error('Could not change visibility.');
        return;
      }
      setPractices((list) => (list ?? []).map((item) => (item.id === p.id ? { ...item, visibility: 'link' } : item)));
      const result = await sharePracticeLink(`${window.location.origin}/p/${p.id}`, p.title);
      if (result === 'failed') toast.error("Made link-shared, but couldn't copy the link.");
      else toast.success('Made link-shared and link copied.');
      return;
    }
    const result = await sharePracticeLink(`${window.location.origin}/p/${p.id}`, p.title);
    if (result === 'copied') toast.success('Link copied.');
    else if (result === 'failed') toast.error("Couldn't copy link.");
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
        <ul className="flex flex-col gap-3">
          {practices.map((p) => (
            <li
              key={p.id}
              className="flex flex-col gap-3 border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm"
            >
              {onOpen ? (
                <button type="button" onClick={() => onOpen(p.id)} className="min-w-0 truncate text-left text-base font-medium underline">
                  {p.title}
                </button>
              ) : (
                <Link href={`/practice?id=${p.id}`} className="min-w-0 truncate text-base font-medium underline">
                  {p.title}
                </Link>
              )}
              {/* One action row: primary first, visibility, destructive last and quiet. Every control is 44px tall. */}
              <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:items-center">
                {onOpen ? (
                  <Button className={ACTION} onClick={() => onOpen(p.id)} aria-label={`Open ${p.title}`}>
                    Open
                  </Button>
                ) : (
                  <Button asChild className={ACTION}>
                    <Link href={`/practice?id=${p.id}`} aria-label={`Open ${p.title}`}>
                      Open
                    </Link>
                  </Button>
                )}
                <Button variant="outline" className={ACTION} onClick={() => share(p)} aria-label={`Share ${p.title}`}>
                  <Share2 />
                  Share
                </Button>
                <select
                  aria-label={`Visibility of ${p.title}`}
                  value={p.visibility}
                  onChange={(e) => pickVisibility(p.id, e.target.value as Visibility)}
                  className="order-2 col-span-3 h-11 min-h-[44px] w-full min-w-0 border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm sm:order-none sm:w-auto sm:min-w-[11rem]"
                >
                  <option value="private">Private</option>
                  <option value="link">Anyone with the link</option>
                  <option value="public">Public</option>
                </select>
                <Button
                  variant="ghost"
                  className={`${ACTION} order-1 text-[var(--color-danger)] hover:bg-[var(--color-danger-surface)] hover:text-[var(--color-danger)] sm:order-none sm:ml-auto`}
                  onClick={() => setDeletingPractice(p)}
                  aria-label={`Delete ${p.title}`}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {deletingPractice && (
        <Dialog open={!!deletingPractice} onOpenChange={(open) => { if (!open) setDeletingPractice(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete {deletingPractice.title}?</DialogTitle>
              <DialogDescription>
                This can&apos;t be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button variant="destructive" onClick={() => remove(deletingPractice.id)}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
