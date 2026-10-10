'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, Copy, Home, RotateCcw } from 'lucide-react';
import { BrandIcon } from '@/shared/components/BrandIcon';
import { buildErrorDetails } from '@/lib/error-details';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
    const [fallbackText, setFallbackText] = useState<string | null>(null);

    useEffect(() => {
        console.error('[App] Unhandled error:', error);
    }, [error]);

    useEffect(() => {
        if (copyState !== 'copied') return;
        const timer = setTimeout(() => setCopyState('idle'), 2000);
        return () => clearTimeout(timer);
    }, [copyState]);

    const copyDetails = async () => {
        const text = buildErrorDetails({
            message: error.message,
            digest: error.digest,
            stack: error.stack,
            href: window.location.href,
            time: new Date().toISOString(),
        });
        try {
            await navigator.clipboard.writeText(text);
            setCopyState('copied');
        } catch {
            // Clipboard blocked: show the text so it can be selected and copied by hand.
            setFallbackText(text);
            setCopyState('failed');
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
            <div className="mb-6">
                <BrandIcon variant="large" />
            </div>
            <h1 className="text-3xl font-heading font-bold text-text-primary mb-2">Something went wrong</h1>
            <p className="text-text-primary/70 mb-2 max-w-md break-words">{error.message || 'An unexpected error stopped this page.'}</p>
            {error.digest && (
                <p className="text-xs text-text-primary/50 mb-4 font-mono break-all">Digest: {error.digest}</p>
            )}
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
                <button
                    type="button"
                    onClick={copyDetails}
                    className="inline-flex items-center gap-2 px-6 py-3 border border-border text-text-primary font-medium hover:bg-text-primary/10 transition-colors"
                >
                    {copyState === 'copied' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copyState === 'copied' ? 'Copied' : 'Copy details'}
                </button>
            </div>
            {fallbackText && (
                <textarea
                    readOnly
                    aria-label="Error details"
                    value={fallbackText}
                    onFocus={(e) => e.currentTarget.select()}
                    rows={8}
                    className="mt-6 w-full max-w-xl p-3 text-left text-xs font-mono bg-surface text-text-primary border border-border"
                />
            )}
            <p className="text-sm text-text-primary/60 mt-8 max-w-md">
                If this keeps happening, paste the details into the{' '}
                <Link href="/feedback" className="underline underline-offset-2 text-primary">
                    feedback form
                </Link>
                .
            </p>
        </div>
    );
}
