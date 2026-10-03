'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Home, RotateCcw } from 'lucide-react';
import { BrandIcon } from '@/shared/components/BrandIcon';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[App] Unhandled error:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
            <div className="mb-6">
                <BrandIcon variant="large" />
            </div>
            <h1 className="text-3xl font-heading font-bold text-text-primary mb-2">Something went wrong</h1>
            <p className="text-text-primary/70 mb-8 max-w-md">
                We hit a problem loading this page. Try again, or head back to the home page.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                    type="button"
                    onClick={reset}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-text-inverse font-medium hover:bg-primary/90 transition-colors"
                >
                    <RotateCcw className="w-4 h-4" />
                    Try again
                </button>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 border border-primary text-primary font-medium hover:bg-primary/10 transition-colors"
                >
                    <Home className="w-4 h-4" />
                    Return Home
                </Link>
            </div>
        </div>
    );
}
