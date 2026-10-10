// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import React from 'react';
import FeedbackPage from '@/app/feedback/page';

(globalThis as { React?: typeof React }).React = React;

afterEach(cleanup);

describe('FeedbackPage form labels and inputs', () => {
  it('links every input to a label and has name and autocomplete attributes', () => {
    render(<FeedbackPage />);

    const name = screen.getByLabelText('Name') as HTMLInputElement;
    expect(name.id).toBe('feedback-name');
    expect(name.getAttribute('name')).toBe('name');
    expect(name.getAttribute('autocomplete')).toBe('name');

    const email = screen.getByLabelText(/Email/) as HTMLInputElement;
    expect(email.id).toBe('feedback-email');
    expect(email.getAttribute('name')).toBe('email');
    expect(email.getAttribute('autocomplete')).toBe('email');

    const area = screen.getByLabelText('Area') as HTMLSelectElement;
    expect(area.id).toBe('feedback-area');
    expect(area.getAttribute('name')).toBe('area');

    const what = screen.getByLabelText('What happened / what you expected') as HTMLTextAreaElement;
    expect(what.id).toBe('feedback-what');
    expect(what.getAttribute('name')).toBe('what');

    const rating = screen.getByLabelText('Overall') as HTMLSelectElement;
    expect(rating.id).toBe('feedback-rating');
    expect(rating.getAttribute('name')).toBe('rating');
  });
});
