'use client';

import type { ChatFriend, ChatMessage } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { ArrowLeft, Phone, Send, Video } from "lucide-react";
import { Input } from "../ui/input";
import MessageBubble from "./message-bubble";
import { ScrollArea } from "../ui/scroll-area";
import { useAuth } from "@/context/auth-context";
import { useEffect, useRef, useState } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue, off, push, serverTimestamp, set } from "firebase/database";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function ChatView({ friend, onClose }: { friend: ChatFriend; onClose: () => void; }) {
    const { appUser } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');

    const getChatId = (uid1: string, uid2: string) => {
        return [uid1, uid2].sort().join('_');
    }

    useEffect(() => {
        if (!appUser) return;

        const chatId = getChatId(appUser.uid, friend.uid);
        const messagesRef = ref(db, `chats/${chatId}/messages`);

        const listener = onValue(messagesRef, (snapshot) => {
            if (snapshot.exists()) {
                const messagesData = snapshot.val();
                const messagesList: ChatMessage[] = Object.keys(messagesData).map(key => ({
                    id: key,
                    ...messagesData[key]
                }));
                messagesList.sort((a, b) => a.timestamp - b.timestamp);
                setMessages(messagesList);
            } else {
                setMessages([]);
            }
        });

        return () => {
            off(messagesRef, 'value', listener);
        };
    }, [appUser, friend.uid]);
    
    useEffect(() => {
        if (scrollAreaRef.current) {
            setTimeout(() => {
                const viewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
                if (viewport) {
                    viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
                }
            }, 100)
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !appUser) return;

        const chatId = getChatId(appUser.uid, friend.uid);
        const messagesRef = ref(db, `chats/${chatId}/messages`);
        const newMessageRef = push(messagesRef);

        const messageData = {
            senderId: appUser.uid,
            text: newMessage,
            timestamp: serverTimestamp(),
        };

        await set(newMessageRef, messageData);
        
        // Also update the last message for both users in their friends list
        const lastMessageData = {
            lastMessage: newMessage,
            lastMessageTimestamp: serverTimestamp(),
        }
        const myFriendRef = ref(db, `friends/${appUser.uid}/${friend.uid}`);
        const theirFriendRef = ref(db, `friends/${friend.uid}/${appUser.uid}`);
        
        await set(myFriendRef, { ...friend, ...lastMessageData });
        await set(theirFriendRef, { 
            uid: appUser.uid,
            displayName: appUser.displayName,
            avatarUrl: appUser.avatarUrl,
            ...lastMessageData,
        });

        setNewMessage('');
    };
    
    const handleCall = (type: 'audio' | 'video') => {
        if (!appUser) return;
    
        const callId = push(ref(db, 'calls')).key;
        if (!callId) return;
    
        const callData = {
            id: callId,
            type,
            caller: {
                uid: appUser.uid,
                displayName: appUser.displayName,
                avatarUrl: appUser.avatarUrl,
            },
            recipient: {
                uid: friend.uid,
                displayName: friend.displayName,
                avatarUrl: friend.avatarUrl,
            },
            status: 'initiating',
            createdAt: serverTimestamp(),
        };
    
        set(ref(db, `calls/${callId}`), callData);
    
        // Add to call history for both users
        const callHistoryEntry = {
            id: callId,
            contactName: friend.displayName,
            contactAvatar: friend.avatarUrl,
            date: Date.now(),
            type: type,
            status: 'outgoing',
        };
        set(ref(db, `callHistory/${appUser.uid}/${callId}`), callHistoryEntry);
        
        const callHistoryForRecipient = {
            ...callHistoryEntry,
            contactName: appUser.displayName,
            contactAvatar: appUser.avatarUrl,
            status: 'missed', // Initially missed until answered
        };
        set(ref(db, `callHistory/${friend.uid}/${callId}`), callHistoryForRecipient);

        router.push(`/call/${callId}`);
      };

    return (
        <div className="h-full flex flex-col bg-background">
            <header className="flex h-16 shrink-0 items-center gap-3 border-b px-4 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={friend.avatarUrl || ''} />
                        <AvatarFallback>{friend.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="font-semibold">{friend.displayName}</h2>
                        <p className={`text-xs ${friend.online ? 'text-green-500' : 'text-muted-foreground'}`}>{friend.online ? 'Online' : 'Offline'}</p>
                    </div>
                </div>
                <div className="ml-auto flex items-center">
                    <Button variant="ghost" size="icon" onClick={() => handleCall('audio')}><Phone className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleCall('video')}><Video className="h-5 w-5" /></Button>
                </div>
            </header>

            <div className="flex-1 overflow-hidden">
                 <ScrollArea className="h-full" ref={scrollAreaRef}>
                    <div className="p-4 space-y-4">
                        {messages.length > 0 ? messages.map((msg) => (
                            <MessageBubble key={msg.id} message={msg} isOwnMessage={msg.senderId === appUser?.uid} />
                        )) : (
                            <div className="text-center text-muted-foreground mt-10">
                                <p>No messages yet. Start the conversation!</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            <form className="flex items-center gap-2 border-t p-2 bg-background sticky bottom-0" onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
                <Input 
                    placeholder="Type a message..." 
                    className="flex-1"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                />
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                    <Send className="h-5 w-5 md:mr-2" />
                    <span className="hidden md:inline">Send</span>
                </Button>
            </form>
        </div>
    );
}
