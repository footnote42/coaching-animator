'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/dialog';

const STORAGE_KEY = 'firstRunSeen';

export function FirstRunModal() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setOpen(true);
    } catch {
      // localStorage blocked (e.g. private browsing) — skip modal
    }
  }, []);

  if (!mounted) return null;

  function handleAcknowledge() {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // ignore
    }
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={() => { /* intentionally blocked — explicit CTA only */ }}>
      <DialogContent
        className="w-[90vw] max-w-sm"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Welcome to Coaching Animator</DialogTitle>
          <DialogDescription>A simple tool for rugby coaches</DialogDescription>
        </DialogHeader>
        <ul className="mt-2 space-y-2 text-sm text-muted-foreground list-disc list-inside">
          <li>Draw drills and plays with drag-and-drop players</li>
          <li>Animate frame-by-frame to show movement</li>
          <li>Share a replay link with your squad</li>
        </ul>
        <button
          onClick={handleAcknowledge}
          className="mt-4 w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Start Animating →
        </button>
      </DialogContent>
    </Dialog>
  );
}
