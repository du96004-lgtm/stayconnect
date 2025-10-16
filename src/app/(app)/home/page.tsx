'use client';

import { MessageSquare, UserPlus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { ChatFriend } from '@/lib/types';
import { useState, useEffect } from 'react';
import AddFriendPopup from '@/components/friends/add-friend-popup';
import ChatView from '@/components/chat/chat-view';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { ref, onValue, off } from 'firebase/database';

export default function HomePage() {
  const [isAddFriendOpen, setAddFriendOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<ChatFriend | null>(null);
  const [friends, setFriends] = useState<ChatFriend[]>([]);
  const { appUser } = useAuth();

  useEffect(() => {
    if (!appUser) return;

    const friendsRef = ref(db, `friends/${appUser.uid}`);
    const listener = onValue(friendsRef, (snapshot) => {
        if (snapshot.exists()) {
            const friendsData = snapshot.val();
            const friendsList: ChatFriend[] = Object.values(friendsData);
            setFriends(friendsList);
        } else {
            setFriends([]);
        }
    });

    return () => {
        off(friendsRef, 'value', listener);
    };
  }, [appUser]);

  return (
    <div className="relative h-full">
       {friends.length > 0 ? (
        <div className="p-4 space-y-2">
            {friends.map((friend) => (
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
                        {friend.lastMessageTimestamp ? new Date(friend.lastMessageTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </p>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{friend.lastMessage || 'No messages yet'}</p>
                </div>
                </CardContent>
            </Card>
            ))}
        </div>
        ) : (
        <div className="flex flex-col items-center justify-center text-center text-muted-foreground mt-20 h-full">
            <MessageSquare className="h-16 w-16 mb-4"/>
            <h2 className="text-xl font-semibold">No chats yet</h2>
            <p className="max-w-xs">Your conversations with friends will appear here once you connect.</p>
        </div>
        )}


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
