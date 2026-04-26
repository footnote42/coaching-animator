// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { MiniPitchSVG } from '@/features/gallery/components/MiniPitchSVG';

describe('MiniPitchSVG', () => {
  it('renders pitch outline rect and halfway line', () => {
    const { container } = render(<MiniPitchSVG entities={null} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(container.querySelector('rect')).toBeTruthy();
    expect(container.querySelector('line')).toBeTruthy();
  });

  it('renders an attacker dot for entity with team: attack', () => {
    const { container } = render(
      <MiniPitchSVG entities={[{ x: 25, y: 37, team: 'attack' }]} />
    );
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBe(1);
    expect(circles[0].getAttribute('fill')).toBe('var(--color-accent-warm)');
  });

  it('renders a defender dot for entity with team: defense', () => {
    const { container } = render(
      <MiniPitchSVG entities={[{ x: 75, y: 37, team: 'defense' }]} />
    );
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBe(1);
    expect(circles[0].getAttribute('fill')).toBe('var(--color-text-primary)');
    expect(circles[0].getAttribute('opacity')).toBe('0.4');
  });

  it('omits neutral entities', () => {
    const { container } = render(
      <MiniPitchSVG
        entities={[
          { x: 10, y: 10, team: 'neutral' },
          { x: 20, y: 20, team: 'attack' },
        ]}
      />
    );
    const circles = container.querySelectorAll('circle');
    // Only the attacker should be rendered
    expect(circles.length).toBe(1);
    expect(circles[0].getAttribute('fill')).toBe('var(--color-accent-warm)');
  });

  it('caps at 15 dots even when 25 entities provided', () => {
    const entities = Array.from({ length: 25 }, (_, i) => ({
      x: i,
      y: i,
      team: 'attack' as const,
    }));
    const { container } = render(<MiniPitchSVG entities={entities} />);
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBeLessThanOrEqual(15);
  });

  it('renders pitch outline only when entities prop is null', () => {
    const { container } = render(<MiniPitchSVG entities={null} />);
    expect(container.querySelector('circle')).toBeNull();
    expect(container.querySelector('rect')).toBeTruthy();
  });

  it('renders pitch outline only when entities prop is empty array', () => {
    const { container } = render(<MiniPitchSVG entities={[]} />);
    expect(container.querySelector('circle')).toBeNull();
    expect(container.querySelector('rect')).toBeTruthy();
  });
});
