'use client';

import { useSyncExternalStore } from 'react';

const COMMENTARY_STORAGE_KEY = 'ca_share_show_commentary';

const listeners = new Set<() => void>();
let override: boolean | null = null;

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

/** The saved choice; with none, shown except on phones. Storage blocked: shown. */
function read(): boolean {
  if (override !== null) return override;
  try {
    const saved = window.sessionStorage.getItem(COMMENTARY_STORAGE_KEY);
    if (saved !== null) return saved === 'true';
    return !((typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 767px)').matches) || window.innerWidth < 768);
  } catch {
    return true;
  }
}

function write(val: boolean) {
  try {
    window.sessionStorage.setItem(COMMENTARY_STORAGE_KEY, String(val));
    override = null;
  } catch {
    override = val; // sessionStorage failure fallback: the choice lasts for this page only
  }
  listeners.forEach((l) => l());
}

/**
 * Whether Commentary is shown, remembered for the browser session. The server and first
 * client render both show it (so hydration matches); the saved or phone default applies after.
 */
export function useCommentaryPreference(): [boolean, (next: boolean | ((prev: boolean) => boolean)) => void] {
  const shown = useSyncExternalStore(subscribe, read, () => true);
  const set = (next: boolean | ((prev: boolean) => boolean)) => write(typeof next === 'function' ? next(read()) : next);
  return [shown, set];
}
