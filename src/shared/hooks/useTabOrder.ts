'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';

export type SectionId = 'home' | 'gallery' | 'playbook' | 'create' | 'help' | 'profile';

const STORAGE_KEY = 'nav_mru_v1';

const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener('storage', onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener('storage', onChange);
  };
}

function readRaw(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function getServerSnapshot(): string | null {
  return null;
}

function parseOrder(raw: string | null, defaultSections: SectionId[]): SectionId[] {
  if (!raw) return defaultSections;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Filter out any IDs that are no longer in the default set
      const validIds = parsed.filter(id => defaultSections.includes(id as SectionId)) as SectionId[];
      // Add any missing IDs from the default set to the end
      const missingIds = defaultSections.filter(id => !validIds.includes(id));
      return [...validIds, ...missingIds];
    }
  } catch (e) {
    console.error('[useTabOrder] Failed to parse stored order:', e);
  }
  return defaultSections;
}

/**
 * Hook to manage the Most Recently Used (MRU) order of navigation tabs.
 * Used for z-index layering to ensure the active and recently visited tabs
 * appear in front of older ones.
 *
 * The order lives in localStorage, read through useSyncExternalStore so the server
 * and first client render both use the default order.
 */
export function useTabOrder(defaultSections: SectionId[]): [SectionId[], (id: SectionId) => void] {
  const raw = useSyncExternalStore(subscribe, readRaw, getServerSnapshot);
  const order = useMemo(() => parseOrder(raw, defaultSections), [raw, defaultSections]);

  const recordVisit = useCallback((id: SectionId) => {
    const prev = parseOrder(readRaw(), defaultSections);
    const newOrder = [id, ...prev.filter(item => item !== id)];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newOrder));
    } catch {
      // Storage blocked: the order simply is not remembered.
    }
    listeners.forEach(l => l());
  }, [defaultSections]);

  return [order, recordVisit];
}
