/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { FirstRunModal } from '@/features/animation/components/FirstRunModal';

describe('FirstRunModal', () => {
  afterEach(cleanup);

  it('renders fixed corner card when open=true', () => {
    const { container } = render(<FirstRunModal open={true} onDismiss={() => {}} />);
    const card = container.firstChild as HTMLElement;
    expect(card).not.toBeNull();
    expect(card.className).toContain('fixed');
    expect(card.className).toContain('bottom-24');
    expect(card.className).toContain('right-4');
  });

  it('does NOT render when open=false', () => {
    const { container } = render(<FirstRunModal open={false} onDismiss={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('clicking "Got it" calls onDismiss', () => {
    const handleDismiss = vi.fn();
    render(<FirstRunModal open={true} onDismiss={handleDismiss} />);
    const button = screen.getByRole('button', { name: /got it/i });
    fireEvent.click(button);
    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });

  it('contains no Radix Dialog elements', () => {
    const { container } = render(<FirstRunModal open={true} onDismiss={() => {}} />);
    // Radix Dialog elements usually have data-state, role="dialog", or specific classes
    const dialogElements = container.querySelectorAll('[role="dialog"]');
    expect(dialogElements.length).toBe(0);
  });

  it('uses rounded-none not rounded-md', () => {
    const { container } = render(<FirstRunModal open={true} onDismiss={() => {}} />);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('rounded-none');
    expect(card.className).not.toContain('rounded-md');
  });
});
