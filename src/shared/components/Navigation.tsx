'use client';

import Link from 'next/link';
import { BrandIcon } from './BrandIcon';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
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
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await signOut();
  };

  const isActive = (path: string) => pathname === path;

  // Share routes are watch-only — no chrome
  if (pathname.startsWith('/share/')) return null;

  // Simplified nav for auth pages
  if (variant === 'simple') {
    return (
      <nav className={`sticky top-0 z-50 border-b border-border bg-surface ${className}`}>
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <BrandIcon variant="header" priority />
            <span className="font-heading font-bold text-lg text-primary">Coaching Animator</span>
          </Link>
        </div>
      </nav>
    );
  }

  const navLinks = (
    <>
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
    </>
  );

  return (
    <nav className={`sticky top-0 z-50 border-b border-border bg-surface ${className}`}>
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <BrandIcon variant="header" priority />
          <span className="font-heading font-bold text-lg text-primary">Coaching Animator</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-4">
          {navLinks}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-text-primary hover:text-primary transition-colors"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-surface px-4 py-3 flex flex-col gap-3">
          {navLinks}
        </div>
      )}
    </nav>
  );
}

export default Navigation;
