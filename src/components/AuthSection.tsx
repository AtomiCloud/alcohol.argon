import React from 'react';
import { Button } from '@/components/ui/button';
import { useClaims } from '@/lib/auth/providers';
import { ProfileDropdown } from './ProfileDropdown';

interface AuthSectionProps {
  isMobile?: boolean;
  onMenuClose?: () => void;
}

export function AuthSection({ isMobile = false, onMenuClose }: AuthSectionProps) {
  const [t, v] = useClaims();

  if (t === 'err') {
    return null;
  }

  const [k, claimState] = v;

  if (!k) {
    if (isMobile) {
      return (
        <div className="flex items-center justify-center py-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">Loading...</span>
        </div>
      );
    }

    // Match desktop ProfileDropdown button dimensions: px-2 py-2 with h-8 w-8 avatar + h-4 w-4 chevron
    return (
      <div className="flex items-center space-x-1 px-2 py-2">
        <div className="h-8 w-8 flex items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
        <div className="h-4 w-4" /> {/* Placeholder for chevron space */}
      </div>
    );
  }

  if (claimState.value.isAuthed) {
    return (
      <ProfileDropdown
        data={claimState.value.data}
        onSignOut={() => window.location.assign('/api/logto/sign-out')}
        isMobile={isMobile}
        onMenuClose={onMenuClose}
      />
    );
  }

  return (
    <Button
      onClick={() => {
        window.location.assign('/api/logto/sign-in');
        onMenuClose?.();
      }}
      className={`bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 ${
        isMobile ? 'w-full justify-center' : ''
      }`}
    >
      <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 16l-4-4m0 0l4-4m0 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1"
        />
      </svg>
      Sign In
    </Button>
  );
}
