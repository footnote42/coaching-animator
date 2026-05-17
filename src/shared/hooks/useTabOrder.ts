'use client';

import { useState, useEffect, useCallback } from 'react';

export type SectionId = 'home' | 'gallery' | 'playbook' | 'create' | 'help' | 'portfolio';

const STORAGE_KEY = 'nav_mru_v1';

/**
 * Hook to manage the Most Recently Used (MRU) order of navigation tabs.
 * Used for z-index layering to ensure the active and recently visited tabs
 * appear in front of older ones.
 */
export function useTabOrder(defaultSections: SectionId[]): [SectionId[], (id: SectionId) => void] {
  const [order, setOrder] = useState<SectionId[]>(defaultSections);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Filter out any IDs that are no longer in the default set
          const validIds = parsed.filter(id => defaultSections.includes(id as SectionId)) as SectionId[];
          
          // Add any missing IDs from the default set to the end
          const missingIds = defaultSections.filter(id => !validIds.includes(id));
          
          setOrder([...validIds, ...missingIds]);
        }
      } catch (e) {
        console.error('[useTabOrder] Failed to parse stored order:', e);
      }
    }
  }, [defaultSections]);

  const recordVisit = useCallback((id: SectionId) => {
    setOrder(prev => {
      const newOrder = [id, ...prev.filter(item => item !== id)];
      // Update storage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newOrder));
      return newOrder;
    });
  }, []);

  return [order, recordVisit];
}
