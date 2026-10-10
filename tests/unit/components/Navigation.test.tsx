// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { Navigation } from '@/shared/components/Navigation';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

vi.mock('@/lib/contexts/UserContext', () => ({
  useUser: () => ({
    user: null,
    profile: null,
    loading: false,
    isAdmin: false,
    isAuthenticated: false,
    signOut: vi.fn(),
    refreshProfile: vi.fn(),
  }),
}));

describe('Navigation', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders Feedback in the header navigation', () => {
    render(<Navigation variant="full" />);
    const feedbackLinks = screen.getAllByRole('link', { name: 'Feedback' });
    expect(feedbackLinks.length).toBeGreaterThanOrEqual(1);
    expect(feedbackLinks[0].getAttribute('href')).toBe('/feedback');
  });

  it('renders Feedback in the phone menu when open', () => {
    render(<Navigation variant="full" />);
    const toggleButton = screen.getByRole('button', { name: 'Toggle menu' });
    fireEvent.click(toggleButton);

    const feedbackLinks = screen.getAllByRole('link', { name: 'Feedback' });
    expect(feedbackLinks.length).toBe(2); // One in desktop header utility, one in mobile dropdown
    expect(feedbackLinks[1].getAttribute('href')).toBe('/feedback');
  });
});
