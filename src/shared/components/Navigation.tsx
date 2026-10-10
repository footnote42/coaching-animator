'use client';

import Link from 'next/link';
import { BrandIcon } from './BrandIcon';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { Menu, X } from 'lucide-react';
import { useUser } from '@/lib/contexts/UserContext';
import { ThemeToggle } from './ThemeToggle';
import { useTabOrder, SectionId } from '@/shared/hooks/useTabOrder';

type NavigationSectionId = SectionId;

interface TabSection {
  id: NavigationSectionId;
  label: string;
  href: string;
  cssVar: string;
  requiresAuth: boolean;
}

const TAB_SECTIONS: TabSection[] = [
  { id: 'home',      label: 'Home',        href: '/',          cssVar: '--c-tab-home',      requiresAuth: false },
  { id: 'gallery',   label: 'Gallery',     href: '/gallery',   cssVar: '--c-tab-gallery',   requiresAuth: false },
  { id: 'playbook',  label: 'My Practices', href: '/my-practices', cssVar: '--c-tab-playbook', requiresAuth: true  },
  { id: 'create',    label: 'Create',      href: '/practice',  cssVar: '--c-tab-create',    requiresAuth: false },
  { id: 'help',      label: 'Help',        href: '/help',      cssVar: '--c-tab-help',      requiresAuth: false },
  { id: 'profile',   label: 'Profile',     href: '/profile',   cssVar: '--c-tab-profile',   requiresAuth: true  },
];

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

  const sectionIds = useMemo(() => TAB_SECTIONS.map(s => s.id), []);
  const [visitOrder, recordVisit] = useTabOrder(sectionIds);
  
  const currentSection = TAB_SECTIONS.find(sec =>
    pathname === sec.href ||
    (sec.id === 'home' && pathname === '/') ||
    (sec.id === 'help' && pathname.startsWith('/help'))
  );
  const activeId = currentSection?.id;

  useEffect(() => {
    if (activeId) {
      recordVisit(activeId);
    }
  }, [activeId, recordVisit]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await signOut();
  };

  const isActive = (path: string) => pathname === path;

  // The share view is watch-only: no chrome
  if (pathname.startsWith('/p/')) return null;

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

  return (
    <nav 
      className={`sticky top-0 z-50 border-b border-border/30 ${className}`}
      style={{ backgroundColor: 'var(--c-nav-cover)' }}
      aria-label="Site navigation"
    >
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 py-2">
          <BrandIcon variant="header" priority />
          <span className="font-heading font-bold text-lg text-white">Coaching Animator</span>
        </Link>

        <div className="flex items-center gap-4 h-full">
          {/* Desktop Tabs */}
          <div className="hidden md:flex items-end h-full pt-2">
            {TAB_SECTIONS
              .filter(sec => !sec.requiresAuth || user)
              .map((sec) => {
                const active = sec.id === activeId;
                return (
                  <Link
                    key={sec.id}
                    href={sec.href}
                    className={`nav-tab text-white text-sm font-medium flex items-center justify-center ${active ? 'nav-tab-active' : ''}`}
                    style={{
                      backgroundColor: `var(${sec.cssVar})`,
                      zIndex: 10 - visitOrder.indexOf(sec.id)
                    }}
                  >
                    <span>{sec.label}</span>
                  </Link>
                );
              })
            }
          </div>
          {/* Desktop Utility Links (Admin, Help, Sign Out) */}
          <div className="hidden md:flex items-center gap-4">
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
            {user && (
              <button
                onClick={handleSignOut}
                className="inline-flex items-center min-h-[44px] text-sm text-white/70 hover:text-white transition-colors"
              >
                Sign Out
              </button>
            )}
          </div>

          {/* Sign in CTA for guests */}
          {!loading && !user && (
            <Link
              href="/login"
              className="inline-flex items-center min-h-[44px] text-sm font-medium text-white/80 hover:text-white transition-colors shrink-0"
            >
              Sign in
            </Link>
          )}

          <ThemeToggle />

          {/* Mobile hamburger */}
          <button
            className="md:hidden inline-flex items-center justify-center min-w-[44px] min-h-[44px] text-white/80 hover:text-white transition-colors shrink-0"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-border/30 bg-[var(--c-nav-cover)] px-4 py-3 flex flex-col gap-3">
          {TAB_SECTIONS
            .filter(sec => !sec.requiresAuth || user)
            .map((sec) => {
              const active = sec.id === activeId;
              return (
                <div key={sec.id} className="flex items-center gap-3 min-h-[44px]">
                  <div 
                    className="w-1 self-stretch" 
                    style={{ backgroundColor: `var(${sec.cssVar})` }} 
                  />
                  <Link
                    href={sec.href}
                    className={`text-sm transition-colors ${active ? 'text-white font-medium' : 'text-white/70 hover:text-white'}`}
                  >
                    {sec.label}
                  </Link>
                </div>
              );
            })
          }
          
          {/* Mobile Utilities */}
          {userRole === 'admin' && (
            <div className="flex items-center gap-3 pt-2 border-t border-white/10 min-h-[44px]">
              <div className="w-1 self-stretch bg-accent-warm" />
              <Link
                href="/admin"
                className={`text-sm transition-colors ${isActive('/admin') ? 'text-accent-warm font-medium' : 'text-accent-warm/70 hover:text-accent-warm'}`}
              >
                Admin
              </Link>
            </div>
          )}

          {!user && (
            <div className="flex items-center gap-3 min-h-[44px]">
              <div className="w-1 self-stretch bg-white/20" />
              <Link href="/login" className="text-sm text-white/70 hover:text-white transition-colors">
                Sign in
              </Link>
            </div>
          )}

          {user && (
            <div className="flex items-center gap-3 min-h-[44px]">
              <div className="w-1 self-stretch bg-white/20" />
              <button
                onClick={handleSignOut}
                className="text-sm text-white/70 hover:text-white transition-colors text-left"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navigation;
