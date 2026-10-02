import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Site map',
  description: 'A full list of pages on Coaching Animator, including the editor, gallery, help guides and legal information.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
