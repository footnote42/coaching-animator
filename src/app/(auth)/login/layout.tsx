import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to Coaching Animator to save your rugby Practices and share them with your team.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
