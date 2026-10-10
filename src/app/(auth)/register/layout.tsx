import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create account',
  description: 'Create a free Coaching Animator account to save Practices to the cloud and share them with your squad.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
