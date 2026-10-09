import { useSyncExternalStore } from 'react';

/**
 * Whether a CSS media query matches. False on the server and during hydration,
 * so the first render matches the server's; it updates straight after.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
