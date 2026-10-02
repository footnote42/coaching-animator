import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset password',
  description: 'Choose a new password for your Coaching Animator account and get back to building rugby plays and drills.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
