'use client';

import { useAuth } from '@/context/auth-context';
import { redirect, usePathname } from 'next/navigation';
import React, { useEffect } from 'react';
import AppLayout from '@/components/layout/app-layout';

export default function AuthenticatedAppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      redirect('/login');
    }
  }, [user, loading, pathname]);

  if (loading || !user) {
    // The AuthProvider shows a global loader, so we can return null here
    // to avoid layout flashes during the initial auth check.
    return null;
  }

  return <AppLayout>{children}</AppLayout>;
}
