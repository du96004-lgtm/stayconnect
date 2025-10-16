'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Plus } from 'lucide-react';
import type { Community } from '@/lib/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const mockCommunities: Community[] = [];

export default function CommunityPage() {
  return (
    <div className="relative h-full">
        {mockCommunities.length > 0 ? (
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
        ) : (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground mt-20 h-full">
                <MessageSquare className="h-16 w-16 mb-4"/>
                <h2 className="text-xl font-semibold">No communities yet</h2>
                <p className="max-w-xs">Create or join a community to start connecting.</p>
            </div>
        )}

        <Button
            className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg bg-accent hover:bg-accent/90"
            aria-label="Create Community"
        >
            <Plus className="h-7 w-7" />
        </Button>
    </div>
  );
}
