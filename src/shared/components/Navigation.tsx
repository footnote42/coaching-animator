'use client';

import Link from 'next/link';
import { BrandIcon } from './BrandIcon';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, HelpCircle } from 'lucide-react';
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

  const initials = profile?.display_name
    ? profile.display_name.substring(0, 2).toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || 'U';

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

          <Link href="/help" className="hidden md:flex p-1.5 text-text-primary/70 hover:text-primary transition-colors" aria-label="Help"><HelpCircle className="w-4 h-4" /></Link>
          <Link href="/help" className="md:hidden text-sm transition-colors text-text-primary hover:text-primary">Help</Link>

          <Link
            href="/app"
            className="px-4 py-2 bg-primary text-text-inverse text-sm font-medium hover:bg-primary/90 transition-colors md:inline-flex md:items-center md:justify-center text-center"
          >
            Create
          </Link>

          <button
            onClick={handleSignOut}
            className="text-sm text-text-primary/70 hover:text-text-primary transition-colors text-left"
          >
            Sign Out
          </button>
        </>
      ) : (
        <>
          <Link href="/help" className="hidden md:flex p-1.5 text-text-primary/70 hover:text-primary transition-colors" aria-label="Help"><HelpCircle className="w-4 h-4" /></Link>
          <Link href="/help" className="md:hidden text-sm transition-colors text-text-primary hover:text-primary">Help</Link>

          <Link
            href="/app"
            className="px-4 py-2 bg-primary text-text-inverse text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm md:inline-flex md:items-center md:justify-center text-center"
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

        <div className="flex items-center gap-4">
          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-4">
            {navLinks}
          </div>

          {/* Persistent Auth / Profile */}
          {!loading && (
            user ? (
              <Link
                href="/profile"
                className="flex items-center justify-center w-8 h-8 bg-primary text-text-inverse font-heading font-bold text-sm shrink-0"
                aria-label="Profile"
              >
                {initials}
              </Link>
            ) : (
              <Link
                href="/login"
                className="text-sm font-medium text-text-primary hover:text-primary transition-colors shrink-0"
              >
                Sign In
              </Link>
            )
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-text-primary hover:text-primary transition-colors shrink-0"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
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
