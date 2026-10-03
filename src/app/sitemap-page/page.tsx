// app/sitemap-page/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronDown, Home, Lock, Shield } from 'lucide-react';

interface RouteNode {
    path: string;
    name: string;
    description: string;
    auth?: 'public' | 'protected' | 'admin';
    children?: RouteNode[];
    status?: 'working' | 'slow' | 'broken';
}

const siteStructure: RouteNode[] = [
    { path: '/', name: 'Home', description: 'Landing page', auth: 'public', status: 'working' },
    {
        path: '/practice',
        name: 'Practice editor',
        description: 'Draw a Practice and its Progressions. Guests can try it without signing in.',
        auth: 'public',
        status: 'working'
    },
    { path: '/gallery', name: 'Gallery', description: 'Practices that Coaches have published', auth: 'public', status: 'working' },
    { path: '/my-practices', name: 'My Practices', description: 'Your saved Practices', auth: 'protected', status: 'working' },
    { path: '/p/[id]', name: 'Share view', description: 'Watch a shared Practice', auth: 'public', status: 'working' },
    { path: '/practice-script/v1/guide', name: 'Practice Script guide', description: 'How to write a Practice Script, for Coaches and agents', auth: 'public', status: 'working' },
    { path: '/profile', name: 'Profile', description: 'Your name, password and account', auth: 'protected', status: 'working' },
    { path: '/login', name: 'Login', description: 'Sign in', auth: 'public', status: 'working' },
    { path: '/register', name: 'Register', description: 'Create an account', auth: 'public', status: 'working' },
    { path: '/forgot-password', name: 'Forgot Password', description: 'Request a password reset', auth: 'public', status: 'working' },
    { path: '/reset-password', name: 'Reset Password', description: 'Complete a password reset', auth: 'public', status: 'working' },
    { path: '/admin', name: 'Admin Dashboard', description: 'Practice reports and bans', auth: 'admin', status: 'working' },
    {
        path: '/help',
        name: 'Help',
        description: 'How-to and coaching guides',
        auth: 'public',
        status: 'working'
    },
    { path: '/terms', name: 'Terms of Service', description: 'Legal terms and conditions', auth: 'public', status: 'working' },
    { path: '/privacy', name: 'Privacy Policy', description: 'Data privacy and usage policy', auth: 'public', status: 'working' },
    { path: '/contact', name: 'Contact', description: 'Contact form and support', auth: 'public', status: 'working' },
    { path: '/sitemap-page', name: 'Site Map', description: 'This page', auth: 'public', status: 'working' },
];

function RouteIcon({ auth }: { auth?: string }) {
    if (auth === 'admin') return <Shield className="w-4 h-4 text-danger" />;
    if (auth === 'protected') return <Lock className="w-4 h-4 text-accent-warm" />;
    return <Home className="w-4 h-4 text-success" />;
}

function StatusBadge({ status }: { status?: string }) {
    if (!status) return null;

    const styles = {
        working: 'bg-success-surface text-success border-success/40',
        slow: 'bg-surface-warm text-text-primary border-accent-warm',
        broken: 'bg-danger-surface text-danger border-danger/40'
    };

    const labels = {
        working: '✓ Working',
        slow: '⚠ Slow',
        broken: '✗ Broken'
    };

    return (
        <span className={`px-2 py-0.5 text-xs font-medium rounded border ${styles[status as keyof typeof styles]}`}>
            {labels[status as keyof typeof labels]}
        </span>
    );
}

function RouteItem({ route, level = 0 }: { route: RouteNode; level?: number }) {
    const [isExpanded, setIsExpanded] = useState(level === 0);
    const hasChildren = route.children && route.children.length > 0;

    return (
        <div className={`border-l border-border ${level > 0 ? 'ml-5' : ''}`}>
            <div className="flex items-start gap-3 p-3 hover:bg-surface-warm group">
                {hasChildren && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="mt-1 p-2.5 hover:bg-surface-warm"
                    >
                        {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                        ) : (
                            <ChevronRight className="w-4 h-4" />
                        )}
                    </button>
                )}
                {!hasChildren && <div className="w-6" />}

                <RouteIcon auth={route.auth} />

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        {route.path.includes('[') ? (
                            <span className="font-mono text-sm font-medium text-text-muted">{route.path}</span>
                        ) : (
                            <Link
                                href={route.path}
                                className="font-mono text-sm font-medium text-primary hover:text-text-primary hover:underline"
                            >
                                {route.path}
                            </Link>
                        )}
                        <StatusBadge status={route.status} />
                    </div>

                    <p className="text-sm font-semibold text-text-primary">{route.name}</p>
                    <p className="text-xs text-text-primary/70 mt-0.5">{route.description}</p>

                    {route.auth && (
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-surface-warm text-text-primary">
                            {route.auth === 'public' && '🌐 Public'}
                            {route.auth === 'protected' && '🔒 Requires Login'}
                            {route.auth === 'admin' && '👑 Admin Only'}
                        </span>
                    )}
                </div>
            </div>

            {hasChildren && isExpanded && (
                <div className="ml-4">
                    {route.children!.map((child) => (
                        <RouteItem key={child.path} route={child} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function SitemapPage() {
    const [filter, setFilter] = useState<string>('all');

    const filteredRoutes = siteStructure.filter(route => {
        if (filter === 'all') return true;
        if (filter === 'broken') return route.status === 'broken';
        if (filter === 'slow') return route.status === 'slow';
        return route.auth === filter;
    });

    const stats = {
        total: siteStructure.length,
        public: siteStructure.filter(r => r.auth === 'public').length,
        protected: siteStructure.filter(r => r.auth === 'protected').length,
        admin: siteStructure.filter(r => r.auth === 'admin').length,
        broken: siteStructure.filter(r => r.status === 'broken').length,
        slow: siteStructure.filter(r => r.status === 'slow').length
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-primary text-text-inverse py-6 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-heading font-bold mb-2">Site Map</h1>
                            <p className="text-text-inverse/70">
                                Complete navigation structure for Coaching Animator
                            </p>
                        </div>
                        <Link
                            href="/"
                            className="px-4 py-2 bg-text-inverse/10 hover:bg-text-inverse/20 transition-colors text-sm font-medium"
                        >
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="bg-surface border-b border-border py-4 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-text-primary">{stats.total}</div>
                            <div className="text-xs text-text-primary/60">Total Routes</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-success">{stats.public}</div>
                            <div className="text-xs text-text-primary/60">Public</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-accent-warm">{stats.protected}</div>
                            <div className="text-xs text-text-primary/60">Protected</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-danger">{stats.admin}</div>
                            <div className="text-xs text-text-primary/60">Admin</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-danger">{stats.broken}</div>
                            <div className="text-xs text-text-primary/60">Broken</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-accent-warm">{stats.slow}</div>
                            <div className="text-xs text-text-primary/60">Slow</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-surface border-b border-border py-3 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 text-sm font-medium ${filter === 'all'
                                ? 'bg-primary text-text-inverse'
                                : 'bg-surface-warm text-text-primary hover:bg-surface-warm'
                                }`}
                        >
                            All Routes
                        </button>
                        <button
                            onClick={() => setFilter('broken')}
                            className={`px-4 py-2 text-sm font-medium ${filter === 'broken'
                                ? 'bg-danger text-background'
                                : 'bg-surface-warm text-text-primary hover:bg-surface-warm'
                                }`}
                        >
                            Broken
                        </button>
                        <button
                            onClick={() => setFilter('slow')}
                            className={`px-4 py-2 text-sm font-medium ${filter === 'slow'
                                ? 'bg-accent-warm text-on-accent'
                                : 'bg-surface-warm text-text-primary hover:bg-surface-warm'
                                }`}
                        >
                            Slow
                        </button>
                        <button
                            onClick={() => setFilter('public')}
                            className={`px-4 py-2 text-sm font-medium ${filter === 'public'
                                ? 'bg-success text-background'
                                : 'bg-surface-warm text-text-primary hover:bg-surface-warm'
                                }`}
                        >
                            Public
                        </button>
                        <button
                            onClick={() => setFilter('protected')}
                            className={`px-4 py-2 text-sm font-medium ${filter === 'protected'
                                ? 'bg-accent-warm text-on-accent'
                                : 'bg-surface-warm text-text-primary hover:bg-surface-warm'
                                }`}
                        >
                            Protected
                        </button>
                        <button
                            onClick={() => setFilter('admin')}
                            className={`px-4 py-2 text-sm font-medium ${filter === 'admin'
                                ? 'bg-danger text-background'
                                : 'bg-surface-warm text-text-primary hover:bg-surface-warm'
                                }`}
                        >
                            Admin
                        </button>
                    </div>
                </div>
            </div>

            {/* Route Tree */}
            <div className="max-w-6xl mx-auto py-8 px-4">
                <div className="bg-surface border border-border">
                    <div className="p-6">
                        <h2 className="text-xl font-heading font-bold text-text-primary mb-4">Route Structure</h2>

                        <div className="space-y-1">
                            {filteredRoutes.map((route) => (
                                <RouteItem key={route.path} route={route} />
                            ))}
                        </div>

                        {filteredRoutes.length === 0 && (
                            <div className="text-center py-12 text-text-primary/60">
                                No routes match the selected filter
                            </div>
                        )}
                    </div>
                </div>

                {/* Legend */}
                <div className="mt-6 bg-surface border border-border p-6">
                    <h3 className="font-heading font-bold text-text-primary mb-3">Legend</h3>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="text-sm font-semibold text-text-primary mb-2">Status Indicators</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <StatusBadge status="working" />
                                    <span className="text-text-primary/70">Route is functional and fast</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <StatusBadge status="slow" />
                                    <span className="text-text-primary/70">Route loads slowly (needs optimization)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <StatusBadge status="broken" />
                                    <span className="text-text-primary/70">Route has errors or doesn&apos;t work</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold text-text-primary mb-2">Access Levels</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <RouteIcon auth="public" />
                                    <span className="text-text-primary/70">Public - Anyone can access</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <RouteIcon auth="protected" />
                                    <span className="text-text-primary/70">Protected - Login required</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <RouteIcon auth="admin" />
                                    <span className="text-text-primary/70">Admin - Admin access only</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
