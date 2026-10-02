import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My animations',
  description: 'Your saved rugby animations in one place. Open, edit, share or organise the plays and drills you have created.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
