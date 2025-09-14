import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AuthSection } from './AuthSection';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  isMobile?: boolean;
}

function NavLink({ href, children, isActive, onClick, isMobile = false }: NavLinkProps) {
  const baseClasses = isMobile
    ? 'block px-3 py-3 text-base font-medium transition-colors duration-200 border-l-4'
    : 'px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200';

  const activeClasses = isMobile
    ? 'bg-blue-50 text-blue-700 border-blue-500 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-400'
    : 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100';

  const inactiveClasses = isMobile
    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-transparent hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/50 dark:hover:border-slate-600'
    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50';

  return (
    <Link href={href} onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
      {children}
    </Link>
  );
}

export function Navbar() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/templates', label: 'Templates' },
    { href: '/config', label: 'Config' },
    { href: '/lottie-demo', label: 'Animations' },
    { href: '/problem-demo', label: 'Problems' },
    { href: '/api-showcase', label: 'API Showcase' },
    { href: '/framework-demo', label: 'Framework' },
  ];

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 shadow-md">
                <span className="text-sm font-bold text-white">AA</span>
              </div>
              <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">Alcohol Argon</span>
            </Link>
            <Badge variant="secondary" className="hidden sm:inline-flex text-xs">
              SSR
            </Badge>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map(item => (
              <NavLink key={item.href} href={item.href} isActive={router.pathname === item.href}>
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-3">
            <AuthSection />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="relative"
            >
              <svg
                className={`h-5 w-5 transition-transform duration-200 ${isMobileMenuOpen ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'max-h-screen opacity-100 visible' : 'max-h-0 opacity-0 invisible overflow-hidden'
          }`}
        >
          <div className="py-4 space-y-1 bg-slate-50/50 dark:bg-slate-800/50 -mx-4 px-4">
            {/* Mobile Navigation Links */}
            {navItems.map(item => (
              <NavLink
                key={item.href}
                href={item.href}
                isActive={router.pathname === item.href}
                onClick={closeMobileMenu}
                isMobile={true}
              >
                {item.label}
              </NavLink>
            ))}

            {/* Mobile Auth Section */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <AuthSection isMobile={true} onMenuClose={closeMobileMenu} />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
