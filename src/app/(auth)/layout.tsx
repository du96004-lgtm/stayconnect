'use client';
import { useAuth } from '@/context/auth-context';
import { redirect } from 'next/navigation';
import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // The main AuthProvider loader is handling this.
  }

  if (user) {
    return redirect('/home');
  }

  return (
    <main className="flex h-full min-h-screen w-full items-center justify-center p-4 bg-secondary/40">
      {children}
    </main>
  );
}
