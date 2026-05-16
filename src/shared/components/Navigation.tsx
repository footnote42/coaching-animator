'use client';

import Link from 'next/link';
import { BrandIcon } from './BrandIcon';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { Menu, X, HelpCircle } from 'lucide-react';
import { useUser } from '@/lib/contexts/UserContext';
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
  { id: 'home', label: 'Home', href: '/', cssVar: '--c-tab-home', requiresAuth: false },
  { id: 'gallery', label: 'Gallery', href: '/gallery', cssVar: '--c-tab-gallery', requiresAuth: false },
  { id: 'playbook', label: 'My Playbook', href: '/my-gallery', cssVar: '--c-tab-playbook', requiresAuth: true },
  { id: 'create', label: 'Create', href: '/app', cssVar: '--c-tab-create', requiresAuth: false },
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
  
  const currentSection = TAB_SECTIONS.find(sec => pathname === sec.href || (sec.id === 'home' && pathname === '/'));
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


  return (
    <nav 
      className={`sticky top-0 z-50 border-b border-border/30 ${className}`}
      style={{ backgroundColor: 'var(--c-nav-cover)' }}
      aria-label="Site navigation"
    >
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-8 h-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 py-2">
            <BrandIcon variant="header" priority />
            <span className="font-heading font-bold text-lg text-white">Coaching Animator</span>
          </Link>

          {/* Desktop Tabs */}
          <div className="hidden md:flex items-end h-full pt-2">
            {TAB_SECTIONS
              .filter(sec => !sec.requiresAuth || user)
              .map((sec) => {
                const active = pathname === sec.href || (sec.id === 'home' && pathname === '/');
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
        </div>

        <div className="flex items-center gap-4">
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
            <Link href="/help" className="p-1.5 text-white/70 hover:text-white transition-colors" aria-label="Help">
              <HelpCircle className="w-4 h-4" />
            </Link>
            {user && (
              <button
                onClick={handleSignOut}
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                Sign Out
              </button>
            )}
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
                className="text-sm font-medium text-white/80 hover:text-white transition-colors shrink-0"
              >
                Sign In
              </Link>
            )
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-white/80 hover:text-white transition-colors shrink-0"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-border/30 bg-[#18120A] px-4 py-3 flex flex-col gap-3">
          {TAB_SECTIONS
            .filter(sec => !sec.requiresAuth || user)
            .map((sec) => {
              const active = pathname === sec.href || (sec.id === 'home' && pathname === '/');
              return (
                <div key={sec.id} className="flex items-center gap-3 min-h-[24px]">
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
            <div className="flex items-center gap-3 pt-2 border-t border-white/10 min-h-[24px]">
              <div className="w-1 self-stretch bg-accent-warm" />
              <Link
                href="/admin"
                className={`text-sm transition-colors ${isActive('/admin') ? 'text-accent-warm font-medium' : 'text-accent-warm/70 hover:text-accent-warm'}`}
              >
                Admin
              </Link>
            </div>
          )}

          <div className="flex items-center gap-3 min-h-[24px]">
            <div className="w-1 self-stretch bg-white/20" />
            <Link 
              href="/help" 
              className={`text-sm transition-colors ${isActive('/help') ? 'text-white font-medium' : 'text-white/70 hover:text-white'}`}
            >
              Help
            </Link>
          </div>

          {user && (
            <div className="flex items-center gap-3 min-h-[24px]">
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
