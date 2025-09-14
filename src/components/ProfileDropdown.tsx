import React from 'react';
import Link from 'next/link';
import { IdTokenClaims } from '@logto/next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { User, LogOut, ChevronDown } from 'lucide-react';

interface ProfileDropdownProps {
  data: IdTokenClaims;
  onSignOut: () => void;
  isMobile?: boolean;
  onMenuClose?: () => void;
}

export function ProfileDropdown({ data, onSignOut, isMobile = false, onMenuClose }: ProfileDropdownProps) {
  const handleSignOut = () => {
    onSignOut();
    onMenuClose?.();
  };

  if (isMobile) {
    return (
      <div className="space-y-3">
        <div className="flex items-center space-x-3 px-3 py-2">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-sm">
            <span className="text-sm font-medium text-white">{data.username?.charAt(0).toUpperCase() || 'U'}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{data.username || 'User'}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">{data.email || 'Authenticated'}</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full justify-center hover:bg-red-50 hover:border-red-200 hover:text-red-700 dark:hover:bg-red-950/20 dark:hover:border-red-800 dark:hover:text-red-400 transition-colors"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center space-x-1 px-2 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-sm">
            <span className="text-xs font-medium text-white">{data.username?.charAt(0).toUpperCase() || 'U'}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-sm">
              <span className="text-sm font-medium text-white">{data.username?.charAt(0).toUpperCase() || 'U'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                {data.username || 'User'}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">{data.email || 'Authenticated User'}</p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/profile" className="w-full flex items-center">
            <User className="mr-2 h-4 w-4" />
            View Profile
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/20"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
