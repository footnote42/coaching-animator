'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { Moon, Sun } from 'lucide-react';
import { applyTheme, readStoredTheme, storeTheme, type Theme } from '@/shared/theme';

const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener('storage', onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener('storage', onChange);
  };
}

// The inline script in <head> normally sets data-theme before first paint; fall back to the stored choice if it did not run.
function getSnapshot(): Theme {
  const applied = document.documentElement.dataset.theme;
  return applied === 'dark' || applied === 'light' ? applied : readStoredTheme();
}

function getServerSnapshot(): Theme {
  return 'light';
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Covers the case where the head script did not run: make the DOM match the theme shown.
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    storeTheme(next);
    listeners.forEach((l) => l());
  };

  const dark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="inline-flex items-center justify-center gap-1.5 min-h-[44px] min-w-[44px] px-2 text-sm font-medium text-white/80 hover:text-white transition-colors shrink-0"
    >
      {dark ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}
      <span className="hidden sm:inline">{dark ? 'Light' : 'Dark'}</span>
    </button>
  );
}
