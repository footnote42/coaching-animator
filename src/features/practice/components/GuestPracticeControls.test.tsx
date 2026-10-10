// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { DevicePracticeOffer } from './GuestPracticeControls';
import { DEVICE_PRACTICE_KEY } from '@/features/practice/hooks/useGuestPractice';

// The components use the automatic JSX runtime; vitest's transform needs React in scope.
(globalThis as { React?: typeof React }).React = React;

vi.mock('@/lib/contexts/UserContext', () => ({ useUser: () => ({ user: { id: 'u1' } }) }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

const fetchMock = vi.fn();

beforeEach(() => {
  window.localStorage.setItem(DEVICE_PRACTICE_KEY, JSON.stringify({ markers: [] }));
  fetchMock.mockReset().mockResolvedValue({ ok: true });
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  window.localStorage.clear();
});

describe('DevicePracticeOffer', () => {
  it('opens Details instead of saving straight away', () => {
    render(<DevicePracticeOffer onSaved={() => {}} />);
    fireEvent.click(screen.getByText('Save to account'));
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Title')).toBeTruthy();
  });

  it('will not save without a title, then saves the title on confirm', async () => {
    const onSaved = vi.fn();
    render(<DevicePracticeOffer onSaved={onSaved} />);
    fireEvent.click(screen.getByText('Save to account'));
    expect((screen.getByText('Save') as HTMLButtonElement).disabled).toBe(true);
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Pop pass' } });
    fireEvent.click(screen.getByText('Save'));
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.title).toBe('Pop pass');
    expect(window.localStorage.getItem(DEVICE_PRACTICE_KEY)).toBeNull();
  });

  it('Cancel keeps the Practice on the device and saves nothing', () => {
    render(<DevicePracticeOffer onSaved={() => {}} />);
    fireEvent.click(screen.getByText('Save to account'));
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Draft' } });
    fireEvent.click(screen.getByText('Cancel'));
    expect(fetchMock).not.toHaveBeenCalled();
    expect(window.localStorage.getItem(DEVICE_PRACTICE_KEY)).not.toBeNull();
    expect(screen.getByText('Save to account')).toBeTruthy();
  });
});
