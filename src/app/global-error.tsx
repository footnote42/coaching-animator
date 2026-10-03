'use client';

import { useEffect } from 'react';

// Replaces the root layout when it fails, so it cannot rely on app styles or components.
export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[App] Global error:', error);
    }, [error]);

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
                </div>
            </body>
        </html>
    );
}
