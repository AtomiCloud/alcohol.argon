import Image from 'next/image';
import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center space-x-3" aria-label="LazyTax home">
            <Image
              src="/logo-source.svg"
              alt="LazyTax logo"
              width={120}
              height={28}
              priority
              className="h-8 md:h-7 lg:h-6 w-auto"
            />
          </Link>

          {/* Right Section */}
          <div className="hidden md:flex items-center space-x-3">
            <ThemeToggle />
          </div>

          {/* Mobile Right Section */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
