// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import React from 'react';
import { ConeSplitButton } from '@/features/practice/components/ConeSplitButton';

(globalThis as { React?: typeof React }).React = React;

afterEach(cleanup);

describe('ConeSplitButton', () => {
  it('renders with at least 44x44 px tap targets for touch', () => {
    const onPlace = vi.fn();
    const onPickColour = vi.fn();
    render(
      <ConeSplitButton
        active={false}
        colour="yellow"
        onPlace={onPlace}
        onPickColour={onPickColour}
      />
    );

    const arrowButton = screen.getByRole('button', { name: 'Cone colour' });
    expect(arrowButton.className).toContain('h-11');
    expect(arrowButton.className).toContain('w-11');
    expect(arrowButton.className).toContain('min-w-11');

    fireEvent.click(arrowButton);
    expect(arrowButton.getAttribute('aria-expanded')).toBe('true');

    const redSwatch = screen.getByRole('button', { name: 'Red cone' });
    expect(redSwatch.className).toContain('h-11');
    expect(redSwatch.className).toContain('w-11');

    fireEvent.click(redSwatch);
    expect(onPickColour).toHaveBeenCalledWith('red');
  });
});
