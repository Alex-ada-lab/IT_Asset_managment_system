'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import NotificationBell from './NotificationBell';

interface TopBarProps {
  title: string;
}

export default function TopBar({ title }: TopBarProps) {
  const { user, logout } = useAuth();

  return (
    <header className="fixed left-64 right-0 top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
      <h1 className="text-lg font-semibold text-slate-900">{title}</h1>

      <div className="flex items-center gap-4">
        <NotificationBell />

        <div className="flex items-center gap-3">
          {/* User avatar */}
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white">
            {user?.email?.charAt(0).toUpperCase() ?? 'U'}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-900 leading-none">
              {user?.email ?? 'User'}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">{user?.roleName ?? ''}</p>
          </div>
          <button
            onClick={logout}
            className="ml-2 rounded-md px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 focus:outline-none"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
