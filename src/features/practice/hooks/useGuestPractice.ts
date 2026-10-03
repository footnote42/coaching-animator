'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useUser } from '@/lib/contexts/UserContext';

/** The one on-device slot a Guest's Practice lives in (strictly necessary storage). */
export const DEVICE_PRACTICE_KEY = 'practice.device';

type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const deviceStore = (): Store | null => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

/** Reads the device Practice text, or null if none/unavailable. */
export function readDevicePractice(store: Store | null = deviceStore()): string | null {
  try {
    return store?.getItem(DEVICE_PRACTICE_KEY) || null;
  } catch {
    return null;
  }
}

/** Saves (or clears, when blank) the device Practice. Returns false if storage failed. */
export function writeDevicePractice(text: string, store: Store | null = deviceStore()): boolean {
  try {
    if (!store) return false;
    if (text.trim()) store.setItem(DEVICE_PRACTICE_KEY, text);
    else store.removeItem(DEVICE_PRACTICE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function clearDevicePractice(store: Store | null = deviceStore()): void {
  try {
    store?.removeItem(DEVICE_PRACTICE_KEY);
  } catch {
    // nothing to clear
  }
}

/** Title for saving a device Practice into an account. */
export function titleFor(text: string): string {
  try {
    const title = JSON.parse(text)?.title;
    if (typeof title === 'string' && title.trim()) return title.trim().slice(0, 100);
  } catch {
    // fall through
  }
  return 'Untitled Practice';
}

/**
 * Keeps a Guest's script text on this device: restores it once on arrival and saves
 * every change immediately. Signed-in Coaches never touch the device slot.
 */
export function useGuestPractice(
  text: string,
  restore: (saved: string) => void,
  skipRestore: boolean,
): { isGuest: boolean } {
  const { user, loading } = useUser();
  const isGuest = !loading && !user;
  const ready = useRef(false);
  const failed = useRef(false);
  const restoring = useRef(false);

  useEffect(() => {
    if (!isGuest || ready.current) return;
    ready.current = true;
    if (skipRestore) return;
    const saved = readDevicePractice();
    if (saved) {
      restoring.current = true;
      restore(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGuest]);

  useEffect(() => {
    if (!isGuest || !ready.current) return;
    // Until a restore lands, the empty text must not wipe the slot.
    if (restoring.current) {
      if (!text) return;
      restoring.current = false;
    }
    if (writeDevicePractice(text)) {
      failed.current = false;
    } else if (!failed.current) {
      failed.current = true;
      toast.error("Couldn't keep this Practice on this device. Use Copy script to keep a copy.");
    }
  }, [isGuest, text]);

  return { isGuest };
}
