'use client';

import { useEffect, useState } from 'react';
import { buildErrorDetails } from '@/lib/error-details';

// Replaces the root layout when it fails, so it cannot rely on app styles or components.
export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
    const [fallbackText, setFallbackText] = useState<string | null>(null);

    useEffect(() => {
        console.error('[App] Global error:', error);
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

    const button = {
        padding: '12px 24px',
        fontWeight: 500,
        fontSize: 16,
        cursor: 'pointer',
        textDecoration: 'none',
        display: 'inline-block',
    } as const;

    return (
        <html lang="en">
            <body
                style={{
                    margin: 0,
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 16,
                    textAlign: 'center',
                    fontFamily: 'system-ui, sans-serif',
                    background: '#1A3D1A',
                    color: '#fff',
                }}
            >
                <h1 style={{ fontSize: 30, margin: '0 0 8px' }}>Something went wrong</h1>
                <p style={{ maxWidth: 420, opacity: 0.9, margin: '0 0 8px', wordBreak: 'break-word' }}>
                    {error.message || 'An unexpected error stopped the app.'}
                </p>
                {error.digest && (
                    <p style={{ fontSize: 12, opacity: 0.6, margin: '0 0 8px', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                        Digest: {error.digest}
                    </p>
                )}
                <p style={{ maxWidth: 420, opacity: 0.8, margin: '0 0 32px' }}>
                    The app hit a serious problem. Try again, or head back to the home page.
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button
                        type="button"
                        onClick={reset}
                        style={{ ...button, background: '#fff', color: '#1A3D1A', border: 'none' }}
                    >
                        Try again
                    </button>
                    {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                    <a href="/" style={{ ...button, color: '#fff', border: '1px solid #fff' }}>
                        Return Home
                    </a>
                    <button
                        type="button"
                        onClick={copyDetails}
                        style={{ ...button, background: 'transparent', color: '#fff', border: '1px solid #fff' }}
                    >
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
                        style={{
                            marginTop: 24,
                            width: '100%',
                            maxWidth: 560,
                            padding: 12,
                            textAlign: 'left',
                            fontSize: 12,
                            fontFamily: 'monospace',
                            background: '#fff',
                            color: '#1A3D1A',
                            border: 'none',
                            boxSizing: 'border-box',
                        }}
                    />
                )}
                <p style={{ fontSize: 14, opacity: 0.8, margin: '32px 0 0', maxWidth: 420 }}>
                    If this keeps happening, paste the details into the{' '}
                    <a href="/feedback" style={{ color: '#fff', textDecoration: 'underline' }}>
                        feedback form
                    </a>
                    .
                </p>
            </body>
        </html>
    );
}
