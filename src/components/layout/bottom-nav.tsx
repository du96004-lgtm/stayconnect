'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, MessageSquare, Phone, Settings as SettingsIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/home', icon: Home, label: 'Home' },
  { href: '/requests', icon: Users, label: 'Requests' },
  { href: '/community', icon: MessageSquare, label: 'Community' },
  { href: '/calls', icon: Phone, label: 'Calls' },
  { href: '/settings', icon: SettingsIcon, label: 'Settings' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center gap-1 text-muted-foreground w-16">
              <item.icon className={cn('h-6 w-6 transition-colors', isActive && 'text-primary')} />
              <span className={cn('text-xs font-medium transition-colors', isActive && 'text-primary')}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
