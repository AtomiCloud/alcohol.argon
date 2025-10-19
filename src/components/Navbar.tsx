import Image from 'next/image';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { AuthSection } from './AuthSection';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useClaims } from '@/lib/auth/providers';

export function Navbar() {
  const [t, v] = useClaims();
  const isAuthed = t === 'ok' && v[0] && v[1]?.value.isAuthed;
  const logoHref = isAuthed ? '/app' : '/';

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-6 sm:px-8 max-w-5xl">
        <div className="flex h-16 items-center justify-between">
          {/* Left Section: Logo */}
          <div className="flex items-center space-x-3">
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
            <Badge
              variant="secondary"
              className="uppercase tracking-wide text-[10px] px-2 py-0.5 bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-800"
              aria-label="Beta"
            >
              Beta
            </Badge>
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
              href="/about"
              className="text-sm text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white"
            >
              About
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white"
                  aria-label="Open navigation menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" sideOffset={8} className="w-56">
                <DropdownMenuLabel className="text-xs uppercase text-slate-500 dark:text-slate-400">
                  Navigate
                </DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href="/why-lazytax" className="font-medium">
                    Why LazyTax
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/about">About</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/pricing">Pricing</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/blog">Blog</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <ThemeToggle />
            <AuthSection />
          </div>
        </div>
      </div>
    </nav>
  );
}
