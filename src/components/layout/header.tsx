'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/auth-context';
import ProfilePopup from '../profile-popup';

const getTitle = (pathname: string) => {
  if (pathname.startsWith('/home')) return 'Chats';
  if (pathname.startsWith('/requests')) return 'Requests';
  if (pathname.startsWith('/community')) return 'Community';
  if (pathname.startsWith('/calls')) return 'Calls';
  if (pathname.startsWith('/settings')) return 'Settings';
  return 'StayConnect';
};

export default function Header() {
  const pathname = usePathname();
  const { appUser } = useAuth();
  const [isProfilePopupOpen, setProfilePopupOpen] = useState(false);

  const title = getTitle(pathname);

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between bg-background/80 px-4 shadow-sm backdrop-blur-sm sticky top-0 z-20">
        <h1 className="text-xl font-bold text-foreground">{title}</h1>
        <button onClick={() => setProfilePopupOpen(true)} aria-label="Open profile">
          <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-primary/50">
            <AvatarImage src={appUser?.avatarUrl || ''} alt={appUser?.displayName || 'User'} />
            <AvatarFallback>
              {appUser?.displayName?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </button>
      </header>
      {isProfilePopupOpen && <ProfilePopup isOpen={isProfilePopupOpen} onOpenChange={setProfilePopupOpen} />}
    </>
  );
}
