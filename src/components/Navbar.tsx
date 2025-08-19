import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
}

function NavLink({ href, children, isActive }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`
        px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
        ${
          isActive
            ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50'
        }
      `}
    >
      {children}
    </Link>
  );
}

export function Navbar() {
  const router = useRouter();

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/templates', label: 'Templates' },
    { href: '/config', label: 'Config' },
    { href: '/lottie-demo', label: 'Animations' },
    { href: '/problem-demo', label: 'Problems' },
    { href: '/api-showcase', label: 'API Showcase' },
    { href: '/framework-demo', label: 'Framework' },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                <span className="text-sm font-bold text-white">AA</span>
              </div>
              <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">Alcohol Argon</span>
            </Link>
            <Badge variant="secondary" className="hidden sm:inline-flex">
              SSR
            </Badge>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map(item => (
              <NavLink key={item.href} href={item.href} isActive={router.pathname === item.href}>
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Mobile Menu Button - could be expanded later */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
