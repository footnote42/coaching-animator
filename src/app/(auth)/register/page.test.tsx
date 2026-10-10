// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

const signUp = vi.fn(async (_args: unknown) => ({ error: null }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));
vi.mock('@/lib/supabase/client', () => ({ createSupabaseBrowserClient: () => ({ auth: { signUp } }) }));
vi.mock('@/features/auth/GoogleSignInButton', () => ({ GoogleSignInButton: () => null }));
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
});
