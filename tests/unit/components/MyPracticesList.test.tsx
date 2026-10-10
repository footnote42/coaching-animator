// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
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

  it('shows Share on every Practice card', async () => {
    render(<MyPracticesList />);
    await screen.findByText('Private drill');
    expect(screen.getByRole('button', { name: 'Share Private drill' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Share Link drill' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Share Public drill' })).toBeTruthy();
  });

  it('copies the share link when native share is unavailable', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    render(<MyPracticesList />);
    fireEvent.click(await screen.findByRole('button', { name: 'Share Link drill' }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/p/b2`));
    expect(toast.success).toHaveBeenCalledWith('Link copied.');
  });

  it('asks first before deleting, and Cancel leaves the Practice', async () => {
    render(<MyPracticesList />);
    await screen.findByText('Private drill');
    const deleteBtn = screen.getByRole('button', { name: 'Delete Private drill' });
    fireEvent.click(deleteBtn);

    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByText('Delete Private drill?')).toBeTruthy();
    expect(screen.getByText("This can't be undone.")).toBeTruthy();

    const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    expect(screen.getByText('Private drill')).toBeTruthy();
  });

  it('confirms delete and removes the Practice', async () => {
    const fetchMock = vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
      if (init?.method === 'DELETE') {
        return Promise.resolve({ ok: true });
      }
      return Promise.resolve({ ok: true, json: async () => ({ practices }) });
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<MyPracticesList />);
    await screen.findByText('Private drill');
    fireEvent.click(screen.getByRole('button', { name: 'Delete Private drill' }));

    const dialog = screen.getByRole('dialog');
    const confirmDeleteBtn = dialog.querySelector('button.bg-destructive, button[class*="destructive"]') || screen.getAllByRole('button', { name: 'Delete' })[0];
    fireEvent.click(confirmDeleteBtn);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/practices/a1', { method: 'DELETE' });
    });
  });

  it('one tap sets link-shared and copies the link on a private Practice', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });

    const fetchMock = vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
      if (init?.method === 'PATCH') {
        return Promise.resolve({ ok: true, json: async () => ({}) });
      }
      return Promise.resolve({ ok: true, json: async () => ({ practices }) });
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<MyPracticesList />);
    await screen.findByText('Private drill');
    fireEvent.click(screen.getByRole('button', { name: 'Share Private drill' }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/practices/a1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibility: 'link' }),
      });
    });

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/p/a1`));
    expect(toast.success).toHaveBeenCalledWith('Made link-shared and link copied.');

    const select = screen.getByLabelText('Visibility of Private drill') as HTMLSelectElement;
    expect(select.value).toBe('link');
  });
});
