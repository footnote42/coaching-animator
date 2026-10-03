// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { toast } from 'sonner';
import { MyPracticesList } from '@/features/practice/components/MyPracticesList';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const practices = [
  { id: 'a1', title: 'Private drill', visibility: 'private' },
  { id: 'b2', title: 'Link drill', visibility: 'link' },
  { id: 'c3', title: 'Public drill', visibility: 'public' },
];

describe('MyPracticesList share action', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ practices }) }));
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('shows Share for link and public Practices, not private', async () => {
    render(<MyPracticesList />);
    await screen.findByText('Link drill');
    expect(screen.getByRole('button', { name: 'Share Link drill' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Share Public drill' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Share Private drill' })).toBeNull();
  });

  it('copies the share link when native share is unavailable', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    render(<MyPracticesList />);
    fireEvent.click(await screen.findByRole('button', { name: 'Share Link drill' }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/p/b2`));
    expect(toast.success).toHaveBeenCalledWith('Link copied.');
  });
});
