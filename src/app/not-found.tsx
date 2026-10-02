
import type { Metadata } from 'next';
import Link from 'next/link';
import { BrandIcon } from '@/shared/components/BrandIcon';
import { Home } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Page not found',
    description: 'We could not find the page you were looking for. Head back to the Coaching Animator home page or browse the gallery.',
};

export const dynamic = 'force-dynamic';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
            <div className="mb-6">
                <BrandIcon variant="large" />
            </div>
            <h1 className="text-3xl font-heading font-bold text-text-primary mb-2">Page Not Found</h1>
            <p className="text-text-primary/70 mb-8 max-w-md">
                The page you are looking for doesn&apos;t exist or has been moved.
            </p>
            <Link
                href="/"
                className="inline-flex items-center gap-2 min-h-[44px] px-6 py-3 bg-primary text-text-inverse font-medium hover:bg-primary/90 transition-colors"
            >
                <Home className="w-4 h-4" />
                Return Home
            </Link>
        </div>
    );
}
