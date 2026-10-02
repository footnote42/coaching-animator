import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile',
  description: 'Manage your Coaching Animator profile, account details and saved settings for creating and sharing rugby animations.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
