import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AuthData } from '@/lib/auth/core/types';

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

interface ProfileDropdownProps {
  data: AuthData;
  onSignOut: () => void;
}

// function ProfileDropdown({ data, onSignOut }: ProfileDropdownProps) {
//   const [isOpen, setIsOpen] = useState(false);
//   const dropdownRef = useRef<HTMLDivElement>(null);
//
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//         setIsOpen(false);
//       }
//     };
//
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);
//
//   return (
//     <div className="relative" ref={dropdownRef}>
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="flex items-center space-x-1 px-2 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//       >
//         <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-sm">
//           <span className="text-xs font-medium text-white">{data.claims.username?.charAt(0).toUpperCase() || 'U'}</span>
//         </div>
//         <svg
//           className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
//           fill="none"
//           stroke="currentColor"
//           viewBox="0 0 24 24"
//         >
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//         </svg>
//       </button>
//
//       {isOpen && (
//         <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50">
//           <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
//             <div className="flex items-center space-x-3">
//               <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-sm">
//                 <span className="text-sm font-medium text-white">
//                   {data.claims.username?.charAt(0).toUpperCase() || 'U'}
//                 </span>
//               </div>
//               <div className="flex-1 min-w-0">
//                 <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
//                   {data.claims.username || 'User'}
//                 </p>
//                 <p className="text-xs text-slate-600 dark:text-slate-400">
//                   {data.claims.email || 'Authenticated User'}
//                 </p>
//               </div>
//             </div>
//           </div>
//
//           <div className="py-2">
//             <Link
//               href="/profile"
//               onClick={() => setIsOpen(false)}
//               className="w-full flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
//             >
//               <svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
//                 />
//               </svg>
//               View Profile
//             </Link>
//             <button
//               onClick={() => {
//                 onSignOut();
//                 setIsOpen(false);
//               }}
//               className="w-full flex items-center px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
//             >
//               <svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
//                 />
//               </svg>
//               Sign Out
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

export function Navbar() {
  const router = useRouter();
  // const authContent = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // const authState = useContent(authContent);
  // if (authState == null) return <></>;

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
          {/*<div className="hidden md:flex items-center space-x-3">*/}
          {/*  {authState.value.isAuthed ? (*/}
          {/*    <ProfileDropdown*/}
          {/*      data={authState.value.data}*/}
          {/*      onSignOut={() => window.location.assign('/api/logto/sign-out')}*/}
          {/*    />*/}
          {/*  ) : (*/}
          {/*    <Button*/}
          {/*      onClick={() => {*/}
          {/*        window.location.assign('/api/logto/sign-in');*/}
          {/*      }}*/}
          {/*      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"*/}
          {/*    >*/}
          {/*      <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">*/}
          {/*        <path*/}
          {/*          strokeLinecap="round"*/}
          {/*          strokeLinejoin="round"*/}
          {/*          strokeWidth={2}*/}
          {/*          d="M11 16l-4-4m0 0l4-4m0 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1"*/}
          {/*        />*/}
          {/*      </svg>*/}
          {/*      Sign In*/}
          {/*    </Button>*/}
          {/*  )}*/}
          {/*</div>*/}

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
          {/*<div className="py-4 space-y-1 bg-slate-50/50 dark:bg-slate-800/50 -mx-4 px-4">*/}
          {/*  /!* Mobile Navigation Links *!/*/}
          {/*  {navItems.map(item => (*/}
          {/*    <NavLink*/}
          {/*      key={item.href}*/}
          {/*      href={item.href}*/}
          {/*      isActive={router.pathname === item.href}*/}
          {/*      onClick={closeMobileMenu}*/}
          {/*      isMobile={true}*/}
          {/*    >*/}
          {/*      {item.label}*/}
          {/*    </NavLink>*/}
          {/*  ))}*/}

          {/*  /!* Mobile Auth Section *!/*/}
          {/*  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">*/}
          {/*    {authState.value.isAuthed ? (*/}
          {/*      <div className="space-y-3">*/}
          {/*        <div className="flex items-center space-x-3 px-3 py-2">*/}
          {/*          <div*/}
          {/*            className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-sm">*/}
          {/*            <span className="text-sm font-medium text-white">*/}
          {/*              {authState.value.data.claims.username?.charAt(0).toUpperCase() || 'U'}*/}
          {/*            </span>*/}
          {/*          </div>*/}
          {/*          <div>*/}
          {/*            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">*/}
          {/*              {authState.value.data.claims.username || 'User'}*/}
          {/*            </p>*/}
          {/*            <p className="text-xs text-slate-600 dark:text-slate-400">Authenticated</p>*/}
          {/*          </div>*/}
          {/*        </div>*/}
          {/*        <Button*/}
          {/*          variant="outline"*/}
          {/*          className="w-full justify-center hover:bg-red-50 hover:border-red-200 hover:text-red-700 dark:hover:bg-red-950/20 dark:hover:border-red-800 dark:hover:text-red-400 transition-colors"*/}
          {/*          onClick={() => {*/}
          {/*            window.location.assign('/api/logto/sign-out');*/}
          {/*            closeMobileMenu();*/}
          {/*          }}*/}
          {/*        >*/}
          {/*          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">*/}
          {/*            <path*/}
          {/*              strokeLinecap="round"*/}
          {/*              strokeLinejoin="round"*/}
          {/*              strokeWidth={2}*/}
          {/*              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"*/}
          {/*            />*/}
          {/*          </svg>*/}
          {/*          Sign Out*/}
          {/*        </Button>*/}
          {/*      </div>*/}
          {/*    ) : (*/}
          {/*      <Button*/}
          {/*        className="w-full justify-center bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"*/}
          {/*        onClick={() => {*/}
          {/*          window.location.assign('/api/logto/sign-in');*/}
          {/*          closeMobileMenu();*/}
          {/*        }}*/}
          {/*      >*/}
          {/*        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">*/}
          {/*          <path*/}
          {/*            strokeLinecap="round"*/}
          {/*            strokeLinejoin="round"*/}
          {/*            strokeWidth={2}*/}
          {/*            d="M11 16l-4-4m0 0l4-4m0 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1"*/}
          {/*          />*/}
          {/*        </svg>*/}
          {/*        Sign In*/}
          {/*      </Button>*/}
          {/*    )}*/}
          {/*  </div>*/}
          {/*</div>*/}
        </div>
      </div>
    </nav>
  );
}
