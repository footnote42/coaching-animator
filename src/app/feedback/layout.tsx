import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Feedback',
  description: 'Tell us what works and what does not in Coaching Animator. Your feedback helps shape the rugby coaching animation tool.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
