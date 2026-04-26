// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { EndorsementBadge } from '@/features/gallery/components/EndorsementBadge';

describe('EndorsementBadge', () => {
  it('renders "HAMPSHIRE RFU" when endorsedBy is "hampshire_rfu"', () => {
    const { getByText } = render(<EndorsementBadge endorsedBy="hampshire_rfu" />);
    expect(getByText('HAMPSHIRE RFU')).toBeTruthy();
  });

  it('renders uppercased text for any non-null endorsedBy value', () => {
    const { getByText } = render(<EndorsementBadge endorsedBy="some_club" />);
    expect(getByText('SOME CLUB')).toBeTruthy();
  });

  it('has an aria-label describing the endorsement', () => {
    const { container } = render(<EndorsementBadge endorsedBy="hampshire_rfu" />);
    const el = container.querySelector('[aria-label]');
    expect(el).toBeTruthy();
    expect(el?.getAttribute('aria-label')).toContain('HAMPSHIRE RFU');
  });
});
