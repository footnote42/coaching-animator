import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Log in',
  description: 'Log in to Coaching Animator to save your rugby animations, build collections and share plays with your team.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
