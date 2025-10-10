import Image from 'next/image';
import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { AuthSection } from './AuthSection';
import { useClaims } from '@/lib/auth/providers';

export function Navbar() {
  const [t, v] = useClaims();
  const isAuthed = t === 'ok' && v[0] && v[1]?.value.isAuthed;
  const logoHref = isAuthed ? '/?stay=true' : '/';

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex h-16 items-center justify-between">
          {/* Left Section: Logo + App (when authed) */}
          <div className="flex items-center space-x-4">
            <Link href={logoHref} className="flex items-center space-x-3" aria-label="LazyTax home">
              <Image
                src="/logo-source.svg"
                alt="LazyTax logo"
                width={120}
                height={28}
                priority
                className="h-8 md:h-7 lg:h-6 w-auto"
              />
            </Link>
            {isAuthed && (
              <Link
                href="/app"
                className="hidden md:inline text-sm text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white"
              >
                App
              </Link>
            )}
          </div>

          {/* Right Section */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/why-lazytax"
              className="text-sm text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white font-semibold"
            >
              Why LazyTax
            </Link>
            <Link
              href="/pricing"
              className="text-sm text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white"
            >
              Pricing
            </Link>
            <Link
              href="/blog"
              className="text-sm text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white"
            >
              Blog
            </Link>
            <ThemeToggle />
            <AuthSection />
          </div>

          {/* Mobile Right Section */}
          <div className="md:hidden flex items-center gap-2">
            <Link
              href="/why-lazytax"
              className="text-sm text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white font-semibold"
            >
              Why LazyTax
            </Link>
            <Link
              href="/pricing"
              className="text-sm text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white"
            >
              Pricing
            </Link>
            <Link
              href="/blog"
              className="text-sm text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white"
            >
              Blog
            </Link>
            <ThemeToggle />
            <AuthSection />
          </div>
        </div>
      </div>
    </nav>
  );
}
