import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { SignInCTA } from '@/components/ui/sign-in-cta';
import { useClaims } from '@/lib/auth/providers';
import { ProfileDropdown } from './ProfileDropdown';

interface AuthSectionProps {
  isMobile?: boolean;
  onMenuClose?: () => void;
}

export function AuthSection({ isMobile = false, onMenuClose }: AuthSectionProps) {
  const [t, v] = useClaims();

  if (t === 'err') return null;
  const [k, claimState] = v;
  if (!k) {
    if (isMobile) {
      return (
        <div className="flex items-center space-x-3 px-3 py-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      );
    }

    // Match desktop ProfileDropdown button dimensions
    return <Skeleton className="h-8 w-8 rounded-full" />;
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
    <SignInCTA
      onClick={() => {
        window.location.assign('/api/logto/sign-in');
        onMenuClose?.();
      }}
      icon="none"
      showIcon={false}
      className={`bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 ${
        isMobile ? 'w-full justify-center' : ''
      }`}
    >
      Sign In
    </SignInCTA>
  );
}
