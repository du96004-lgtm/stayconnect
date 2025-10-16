'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import type { Community } from '@/lib/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const mockCommunities: Community[] = [
    { id: 'c1', name: 'General Chat', creator: 'admin', memberCount: 152 },
    { id: 'c2', name: 'Gamers Unite', creator: 'user2', memberCount: 89 },
    { id: 'c3', name: 'Book Club', creator: 'user3', memberCount: 45 },
];

export default function CommunityPage() {
  return (
    <div className="relative h-full">
        <div className="p-4 space-y-3">
            {mockCommunities.map((community) => (
                <Card key={community.id} className="cursor-pointer hover:bg-secondary transition-colors">
                    <CardContent className="p-4 flex justify-between items-center">
                        <div className='flex items-center gap-4'>
                             <Avatar>
                                <AvatarFallback className='bg-primary/20 text-primary font-bold'>
                                    {community.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="font-semibold text-lg">{community.name}</h3>
                                <p className="text-sm text-muted-foreground">{community.memberCount} members</p>
                            </div>
                        </div>
                        <Button>Join</Button>
                    </CardContent>
                </Card>
            ))}
        </div>

        <Button
            className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg bg-accent hover:bg-accent/90"
            aria-label="Create Community"
        >
            <Plus className="h-7 w-7" />
        </Button>
    </div>
  );
}
