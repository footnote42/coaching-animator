'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { applyTheme, readStoredTheme, storeTheme, type Theme } from '@/shared/theme';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');

  // The inline script in <head> has usually applied the theme already; this syncs state and covers the case where it did not run.
  useEffect(() => {
    const stored = readStoredTheme();
    applyTheme(stored);
    setTheme(stored);
  }, []);

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    storeTheme(next);
    setTheme(next);
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
