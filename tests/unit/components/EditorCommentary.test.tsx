// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/lib/contexts/UserContext', () => ({
  useUser: () => ({
    user: null,
    profile: null,
    loading: false,
    signOut: vi.fn(),
  }),
}));

import { useEditorWorkspace } from '@/features/practice/hooks/useEditorWorkspace';

(globalThis as { React?: typeof React }).React = React;

afterEach(() => {
  window.sessionStorage.clear();
});

describe('useEditorWorkspace Commentary toggle (#198)', () => {
  it('toggles commentary and stores in ca_share_show_commentary', () => {
    const { result } = renderHook(() => useEditorWorkspace());
    expect(result.current.showCommentary).toBe(true);

    act(() => {
      result.current.setShowCommentary(false);
    });

    expect(result.current.showCommentary).toBe(false);
    expect(window.sessionStorage.getItem('ca_share_show_commentary')).toBe('false');

    act(() => {
      result.current.setShowCommentary(true);
    });

    expect(result.current.showCommentary).toBe(true);
    expect(window.sessionStorage.getItem('ca_share_show_commentary')).toBe('true');
  });

  it('starts collapsed on phones when no saved state exists', () => {
    const origMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('max-width'),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })) as unknown as typeof window.matchMedia;

    try {
      const { result } = renderHook(() => useEditorWorkspace());
      expect(result.current.showCommentary).toBe(false);
    } finally {
      window.matchMedia = origMatchMedia;
    }
  });
});
