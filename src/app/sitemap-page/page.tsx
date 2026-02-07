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
    {
        path: '/',
        name: 'Home / Landing Page',
        description: 'Main landing page with feature overview and CTAs',
        auth: 'public',
        status: 'working'
    },
    {
        path: '/app',
        name: 'Animation Editor',
        description: 'Main canvas editor for creating animations',
        auth: 'public',
        status: 'working',
        children: [
            {
                path: '/app?mode=guest',
                name: 'Guest Mode',
                description: '10-frame limit, no save to cloud',
                auth: 'public'
            }
        ]
    },
    {
        path: '/gallery',
        name: 'Public Gallery',
        description: 'Browse all published animations from the community (links to /replay/[id])',
        auth: 'public',
        status: 'working'
    },
    {
        path: '/my-gallery',
        name: 'My Playbook',
        description: 'Personal saved animations (cloud storage)',
        auth: 'protected',
        status: 'working'
    },
    {
        path: '/replay/[id]',
        name: 'Replay Viewer',
        description: 'View shared animation replays',
        auth: 'public',
        status: 'working'
    },
    {
        path: '/profile',
        name: 'User Profile',
        description: 'View and edit user profile',
        auth: 'protected',
        status: 'working'
    },
    {
        path: '/login',
        name: 'Login',
        description: 'User authentication',
        auth: 'public',
        status: 'working'
    },
    {
        path: '/register',
        name: 'Register',
        description: 'Create new account',
        auth: 'public',
        status: 'working'
    },
    {
        path: '/forgot-password',
        name: 'Forgot Password',
        description: 'Request password reset',
        auth: 'public',
        status: 'working'
    },
    {
        path: '/reset-password',
        name: 'Reset Password',
        description: 'Complete password reset',
        auth: 'public',
        status: 'working'
    },
    {
        path: '/admin',
        name: 'Admin Dashboard',
        description: 'Moderation and analytics',
        auth: 'admin',
        status: 'working',
        children: [
            {
                path: '/admin/reports',
                name: 'Reports Queue',
                description: 'Review flagged content',
                auth: 'admin'
            },
            {
                path: '/admin/animations',
                name: 'All Animations',
                description: 'Manage all animations',
                auth: 'admin'
            },
            {
                path: '/admin/users',
                name: 'User Management',
                description: 'View and manage users',
                auth: 'admin'
            }
        ]
    },
    {
        path: '/terms',
        name: 'Terms of Service',
        description: 'Legal terms and conditions',
        auth: 'public',
        status: 'working'
    },
    {
        path: '/privacy',
        name: 'Privacy Policy',
        description: 'Data privacy and usage policy',
        auth: 'public',
        status: 'working'
    },
    {
        path: '/contact',
        name: 'Contact',
        description: 'Contact form and support',
        auth: 'public',
        status: 'working'
    },
    {
        path: '/offline',
        name: 'Offline Fallback',
        description: 'Offline mode page',
        auth: 'public',
        status: 'working'
    },
    {
        path: '/sitemap-page',
        name: 'Site Map',
        description: 'This page - complete site navigation structure',
        auth: 'public',
        status: 'working'
    },
    {
        path: '/api',
        name: 'API Routes',
        description: 'Backend endpoints',
        auth: 'public',
        children: [
            {
                path: '/api/animations',
                name: 'Animations API',
                description: 'CRUD operations for animations',
                auth: 'protected'
            },
            {
                path: '/api/gallery',
                name: 'Gallery API',
                description: 'Fetch public gallery items',
                auth: 'public'
            },
            {
                path: '/api/upvote',
                name: 'Upvote API',
                description: 'Handle animation upvotes',
                auth: 'protected'
            },
            {
                path: '/api/report',
                name: 'Report API',
                description: 'Submit content reports',
                auth: 'protected'
            },
            {
                path: '/api/admin',
                name: 'Admin API',
                description: 'Admin operations',
                auth: 'admin'
            }
        ]
    }
];

function RouteIcon({ auth }: { auth?: string }) {
    if (auth === 'admin') return <Shield className="w-4 h-4 text-red-500" />;
    if (auth === 'protected') return <Lock className="w-4 h-4 text-yellow-500" />;
    return <Home className="w-4 h-4 text-green-500" />;
}

function StatusBadge({ status }: { status?: string }) {
    if (!status) return null;

    const styles = {
        working: 'bg-green-100 text-green-800 border-green-300',
        slow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        broken: 'bg-red-100 text-red-800 border-red-300'
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
        <div className={`border-l-2 border-gray-200 ${level > 0 ? 'ml-5' : ''}`}>
            <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded group">
                {hasChildren && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="mt-1 p-1 hover:bg-gray-200 rounded"
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
                        <Link
                            href={route.path}
                            className="font-mono text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                        >
                            {route.path}
                        </Link>
                        <StatusBadge status={route.status} />
                    </div>

                    <p className="text-sm font-semibold text-gray-900">{route.name}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{route.description}</p>

                    {route.auth && (
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded">
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
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-[#1A3D1A] text-white py-6 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">🗺️ Site Map</h1>
                            <p className="text-gray-300">
                                Complete navigation structure for Coaching Animator
                            </p>
                        </div>
                        <Link
                            href="/"
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded transition-colors text-sm font-medium"
                        >
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="bg-white border-b border-gray-200 py-4 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                            <div className="text-xs text-gray-600">Total Routes</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{stats.public}</div>
                            <div className="text-xs text-gray-600">Public</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600">{stats.protected}</div>
                            <div className="text-xs text-gray-600">Protected</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{stats.admin}</div>
                            <div className="text-xs text-gray-600">Admin</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{stats.broken}</div>
                            <div className="text-xs text-gray-600">Broken</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600">{stats.slow}</div>
                            <div className="text-xs text-gray-600">Slow</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white border-b border-gray-200 py-3 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 text-sm font-medium rounded ${filter === 'all'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            All Routes
                        </button>
                        <button
                            onClick={() => setFilter('broken')}
                            className={`px-4 py-2 text-sm font-medium rounded ${filter === 'broken'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            🔴 Broken
                        </button>
                        <button
                            onClick={() => setFilter('slow')}
                            className={`px-4 py-2 text-sm font-medium rounded ${filter === 'slow'
                                ? 'bg-yellow-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            ⚠️ Slow
                        </button>
                        <button
                            onClick={() => setFilter('public')}
                            className={`px-4 py-2 text-sm font-medium rounded ${filter === 'public'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            🌐 Public
                        </button>
                        <button
                            onClick={() => setFilter('protected')}
                            className={`px-4 py-2 text-sm font-medium rounded ${filter === 'protected'
                                ? 'bg-yellow-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            🔒 Protected
                        </button>
                        <button
                            onClick={() => setFilter('admin')}
                            className={`px-4 py-2 text-sm font-medium rounded ${filter === 'admin'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            👑 Admin
                        </button>
                    </div>
                </div>
            </div>

            {/* Route Tree */}
            <div className="max-w-6xl mx-auto py-8 px-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Route Structure</h2>

                        <div className="space-y-1">
                            {filteredRoutes.map((route) => (
                                <RouteItem key={route.path} route={route} />
                            ))}
                        </div>

                        {filteredRoutes.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                No routes match the selected filter
                            </div>
                        )}
                    </div>
                </div>

                {/* Legend */}
                <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-900 mb-3">Legend</h3>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Status Indicators</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <StatusBadge status="working" />
                                    <span className="text-gray-600">Route is functional and fast</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <StatusBadge status="slow" />
                                    <span className="text-gray-600">Route loads slowly (needs optimization)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <StatusBadge status="broken" />
                                    <span className="text-gray-600">Route has errors or doesn&apos;t work</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Access Levels</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <RouteIcon auth="public" />
                                    <span className="text-gray-600">Public - Anyone can access</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <RouteIcon auth="protected" />
                                    <span className="text-gray-600">Protected - Login required</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <RouteIcon auth="admin" />
                                    <span className="text-gray-600">Admin - Admin access only</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
