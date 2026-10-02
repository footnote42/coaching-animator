import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with the Coaching Animator team with questions, bug reports or ideas for improving the rugby animation tool.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
