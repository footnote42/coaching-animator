import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forgot password',
  description: 'Request a password reset link for your Coaching Animator account. We will email you a link to choose a new password.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
