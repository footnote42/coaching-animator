import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin',
  description: 'Moderation dashboard for Coaching Animator administrators to review reports and manage community content.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
