'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/lib/contexts/UserContext';

interface NavigationProps {
  /** Simplified variant for auth pages - just logo, no navigation links */
  variant?: 'full' | 'simple';
  /** Optional class for the container */
  className?: string;
}


export function Navigation({ variant = 'full', className = '' }: NavigationProps) {
  const pathname = usePathname();
  const { user, profile, loading, signOut } = useUser();
  const userRole = profile?.role;

  const handleSignOut = async () => {
    await signOut();
  };

  const isActive = (path: string) => pathname === path;

  // Simplified nav for auth pages
  if (variant === 'simple') {
    return (
      <nav className={`border-b border-border bg-surface ${className}`}>
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🏉</span>
            <span className="font-heading font-bold text-lg text-primary">Coaching Animator</span>
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <nav className={`border-b border-border bg-surface ${className}`}>
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🏉</span>
          <span className="font-heading font-bold text-lg text-primary">Coaching Animator</span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-4">
          <Link
            href="/gallery"
            className={`text-sm transition-colors ${isActive('/gallery')
              ? 'text-primary font-medium'
              : 'text-text-primary hover:text-primary'
              }`}
          >
            Public Gallery
          </Link>

          {loading ? (
            <div className="w-20 h-8 bg-surface-warm animate-pulse" />
          ) : user ? (
            <>
              <Link
                href="/my-gallery"
                className={`text-sm transition-colors ${isActive('/my-gallery')
                  ? 'text-primary font-medium'
                  : 'text-text-primary hover:text-primary'
                  }`}
              >
                My Playbook
              </Link>

              <Link
                href="/profile"
                className={`text-sm transition-colors ${isActive('/profile')
                  ? 'text-primary font-medium'
                  : 'text-text-primary hover:text-primary'
                  }`}
              >
                Profile
              </Link>

              {userRole === 'admin' && (
                <Link
                  href="/admin"
                  className={`text-sm transition-colors ${isActive('/admin')
                    ? 'text-accent-warm font-medium'
                    : 'text-accent-warm/80 hover:text-accent-warm'
                    }`}
                >
                  Admin
                </Link>
              )}

              <Link
                href="/app"
                className="px-4 py-2 bg-primary text-text-inverse text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Create
              </Link>

              <button
                onClick={handleSignOut}
                className="text-sm text-text-primary/70 hover:text-text-primary transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-text-primary hover:text-primary transition-colors"
              >
                Sign In
              </Link>

              <Link
                href="/register"
                className="px-4 py-2 bg-primary text-text-inverse text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
