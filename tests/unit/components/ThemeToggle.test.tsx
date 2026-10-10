// @vitest-environment jsdom
import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { ThemeToggle } from '@/shared/components/ThemeToggle';
import { THEME_INIT_SCRIPT } from '@/shared/theme';

const root = document.documentElement;

beforeEach(() => {
  window.localStorage.clear();
  delete root.dataset.theme;
});

afterEach(() => {
  cleanup();
});

describe('ThemeToggle', () => {
  it('is light by default', () => {
    render(<ThemeToggle />);
    expect(root.dataset.theme).toBe('light');
    expect(screen.getByRole('button', { name: 'Switch to dark mode' })).toBeTruthy();
  });

  it('keeps the dark choice across a remount (reload)', () => {
    const first = render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button', { name: 'Switch to dark mode' }));
    expect(root.dataset.theme).toBe('dark');
    expect(window.localStorage.getItem('ca-theme')).toBe('dark');

    first.unmount();
    delete root.dataset.theme; // a fresh page load starts without the attribute

    render(<ThemeToggle />);
    expect(root.dataset.theme).toBe('dark');
    expect(screen.getByRole('button', { name: 'Switch to light mode' })).toBeTruthy();
  });

  it('can switch back to light and remembers that too', () => {
    window.localStorage.setItem('ca-theme', 'dark');
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button', { name: 'Switch to light mode' }));
    expect(root.dataset.theme).toBe('light');
    expect(window.localStorage.getItem('ca-theme')).toBe('light');
  });

  it('still works when storage throws', () => {
    const original = Storage.prototype.getItem;
    const originalSet = Storage.prototype.setItem;
    Storage.prototype.getItem = () => {
      throw new Error('blocked');
    };
    Storage.prototype.setItem = () => {
      throw new Error('blocked');
    };
    try {
      render(<ThemeToggle />);
      expect(root.dataset.theme).toBe('light');
      fireEvent.click(screen.getByRole('button', { name: 'Switch to dark mode' }));
      expect(root.dataset.theme).toBe('dark');
    } finally {
      Storage.prototype.getItem = original;
      Storage.prototype.setItem = originalSet;
    }
  });
});

describe('theme init script (no flash)', () => {
  it('sets data-theme from storage before React runs', () => {
    window.localStorage.setItem('ca-theme', 'dark');
    new Function(THEME_INIT_SCRIPT)();
    expect(root.dataset.theme).toBe('dark');
  });

  it('falls back to light when nothing is stored', () => {
    new Function(THEME_INIT_SCRIPT)();
    expect(root.dataset.theme).toBe('light');
  });

  it('follows a dark system setting when nothing is stored', () => {
    const original = window.matchMedia;
    window.matchMedia = ((q: string) => ({ matches: q.includes('dark') })) as unknown as typeof window.matchMedia;
    try {
      new Function(THEME_INIT_SCRIPT)();
      expect(root.dataset.theme).toBe('dark');
      delete root.dataset.theme;
      render(<ThemeToggle />);
      expect(root.dataset.theme).toBe('dark');
    } finally {
      window.matchMedia = original;
    }
  });
});
