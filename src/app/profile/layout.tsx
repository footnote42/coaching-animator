import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile',
  description: 'Manage your Coaching Animator profile, display name, password and account.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
