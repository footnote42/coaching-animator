import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create an account',
  description: 'Create a free Coaching Animator account to save animations to the cloud, share plays and build collections for your squad.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
