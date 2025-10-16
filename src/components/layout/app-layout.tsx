'use client';

import React from 'react';
import Header from './header';
import BottomNav from './bottom-nav';
import IncomingCallManager from '../call/incoming-call-manager';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col">
      <Header />
      <main className="flex-1 overflow-y-auto pb-20">{children}</main>
      <BottomNav />
      <IncomingCallManager />
    </div>
  );
}
