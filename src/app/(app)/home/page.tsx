'use client';

import { UserPlus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { ChatFriend } from '@/lib/types';
import { useState } from 'react';
import AddFriendPopup from '@/components/friends/add-friend-popup';
import ChatView from '@/components/chat/chat-view';
import { AnimatePresence, motion } from 'framer-motion';

const mockFriends: ChatFriend[] = [
  { uid: '1', displayName: 'Alice', avatarUrl: 'https://picsum.photos/seed/friend1/200', online: true, lastMessage: "Hey, what's up?", lastMessageTimestamp: Date.now() - 1000 * 60 * 5 },
  { uid: '2', displayName: 'Bob', avatarUrl: 'https://picsum.photos/seed/friend2/200', online: false, lastMessage: 'See you tomorrow!', lastMessageTimestamp: Date.now() - 1000 * 60 * 60 * 2 },
  { uid: '3', displayName: 'Charlie', avatarUrl: 'https://picsum.photos/seed/friend3/200', online: true, lastMessage: 'Sounds good!', lastMessageTimestamp: Date.now() - 1000 * 60 * 30 },
];

export default function HomePage() {
  const [isAddFriendOpen, setAddFriendOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<ChatFriend | null>(null);

  return (
    <div className="relative h-full">
      <div className="p-4 space-y-2">
        {mockFriends.map((friend) => (
          <Card key={friend.uid} className="cursor-pointer hover:bg-secondary transition-colors" onClick={() => setSelectedChat(friend)}>
            <CardContent className="p-3 flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-14 w-14 border-2 border-primary/20">
                  <AvatarImage src={friend.avatarUrl || ''} />
                  <AvatarFallback>{friend.displayName?.charAt(0)}</AvatarFallback>
                </Avatar>
                {friend.online && <div className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-500 rounded-full border-2 border-card" />}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold">{friend.displayName}</h3>
                  <p className="text-xs text-muted-foreground shrink-0">
                    {new Date(friend.lastMessageTimestamp || 0).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground truncate">{friend.lastMessage}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button
        onClick={() => setAddFriendOpen(true)}
        className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg bg-accent hover:bg-accent/90"
        aria-label="Add Friend"
      >
        <UserPlus className="h-7 w-7" />
      </Button>

      <AddFriendPopup isOpen={isAddFriendOpen} onOpenChange={setAddFriendOpen} />
      
      <AnimatePresence>
        {selectedChat && (
           <motion.div
            className="absolute inset-0 z-30"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <ChatView friend={selectedChat} onClose={() => setSelectedChat(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
