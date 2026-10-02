'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith('/share/') || pathname?.startsWith('/app')) {
    return null;
  }

  return (
    <footer className="border-t border-border bg-surface mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-text-primary/50">
        <Link href="/help" className="inline-flex items-center min-h-[44px] hover:text-text-primary transition-colors">Help</Link>
        <Link href="/help/coaching" className="inline-flex items-center min-h-[44px] hover:text-text-primary transition-colors">Coaching Guide</Link>
        <Link href="/contact" className="inline-flex items-center min-h-[44px] hover:text-text-primary transition-colors">Contact</Link>
        <Link href="/feedback" className="inline-flex items-center min-h-[44px] hover:text-text-primary transition-colors">Feedback</Link>
        <Link href="/legal/terms" className="inline-flex items-center min-h-[44px] hover:text-text-primary transition-colors">Terms</Link>
        <Link href="/legal/privacy" className="inline-flex items-center min-h-[44px] hover:text-text-primary transition-colors">Privacy</Link>
        <Link href="/sitemap-page" className="inline-flex items-center min-h-[44px] hover:text-text-primary transition-colors">Sitemap</Link>
        <a href="https://waynetellis.com/workshop/projects" className="inline-flex items-center min-h-[44px] hover:text-text-primary transition-colors">Built by Wayne Ellis · waynetellis.com</a>
      </div>
    </footer>
  );
}
