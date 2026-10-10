// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

const signUp = vi.fn(async (_args: unknown) => ({ error: null }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));
vi.mock('@/lib/supabase/client', () => ({ createSupabaseBrowserClient: () => ({ auth: { signUp } }) }));
vi.mock('@/lib/api-client', () => ({ postWithRetry: vi.fn() }));

import RegisterPage from './page';

// The page relies on Next's automatic JSX runtime; vitest compiles it classic.
(globalThis as { React?: typeof React }).React = React;

function fill() {
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.co' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password1' } });
  fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password1' } });
  fireEvent.click(screen.getByLabelText(/I agree to the/));
}

beforeEach(() => signUp.mockClear());
afterEach(cleanup);

describe('register page 18+ declaration', () => {
  it('shows an unticked "I am 18 or over" checkbox', () => {
    render(<RegisterPage />);
    expect((screen.getByLabelText('I am 18 or over') as HTMLInputElement).checked).toBe(false);
  });

  it('blocks sign-up until ticked', async () => {
    render(<RegisterPage />);
    fill();
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));
    expect(await screen.findByText(/18 or over to create an account/)).toBeTruthy();
    expect(signUp).not.toHaveBeenCalled();
  });

  it('sends age_confirmed in user metadata when ticked', async () => {
    render(<RegisterPage />);
    fill();
    fireEvent.click(screen.getByLabelText('I am 18 or over'));
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));
    await waitFor(() => expect(signUp).toHaveBeenCalled());
    const arg = signUp.mock.calls[0][0] as { options: { data: unknown } };
    expect(arg.options.data).toEqual({ age_confirmed: true });
  });

  it('has linked labels, name and autocomplete attributes, and a 44px tap target row', () => {
    render(<RegisterPage />);
    const email = screen.getByLabelText('Email') as HTMLInputElement;
    expect(email.getAttribute('name')).toBe('email');
    expect(email.getAttribute('autocomplete')).toBe('email');

    const password = screen.getByLabelText('Password', { exact: true }) as HTMLInputElement;
    expect(password.getAttribute('name')).toBe('password');
    expect(password.getAttribute('autocomplete')).toBe('new-password');

    const confirmPassword = screen.getByLabelText('Confirm Password') as HTMLInputElement;
    expect(confirmPassword.getAttribute('name')).toBe('confirmPassword');
    expect(confirmPassword.getAttribute('autocomplete')).toBe('new-password');

    const adultCheckbox = screen.getByLabelText('I am 18 or over') as HTMLInputElement;
    expect(adultCheckbox.getAttribute('name')).toBe('adult');
    const adultLabel = adultCheckbox.closest('label');
    expect(adultLabel?.className).toContain('min-h-[44px]');
  });
});
