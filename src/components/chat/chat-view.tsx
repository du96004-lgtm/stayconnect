'use client';

import type { ChatFriend, ChatMessage } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { ArrowLeft, Phone, Send, Video } from "lucide-react";
import { Input } from "../ui/input";
import MessageBubble from "./message-bubble";
import { ScrollArea } from "../ui/scroll-area";
import { useAuth } from "@/context/auth-context";
import { useEffect, useRef } from "react";

const mockMessages: ChatMessage[] = [
    { id: '1', senderId: '1', text: "Hey, what's up?", timestamp: Date.now() - 1000 * 60 * 5 },
    { id: '2', senderId: 'me', text: "Not much, just working on the project. You?", timestamp: Date.now() - 1000 * 60 * 4 },
    { id: '3', senderId: '1', text: "Same here. It's coming along nicely.", timestamp: Date.now() - 1000 * 60 * 3 },
    { id: '4', senderId: 'me', text: "Totally. Let's catch up later?", timestamp: Date.now() - 1000 * 60 * 2 },
    { id: '5', senderId: '1', text: "Sounds good!", timestamp: Date.now() - 1000 * 60 * 1 },
];

export default function ChatView({ friend, onClose }: { friend: ChatFriend; onClose: () => void; }) {
    const { appUser } = useAuth();
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    
    // In a real app, 'me' would be appUser.uid
    const myId = 'me';

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, []);

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
                    <Button variant="ghost" size="icon"><Phone className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon"><Video className="h-5 w-5" /></Button>
                </div>
            </header>

            <div className="flex-1 overflow-hidden">
                 <ScrollArea className="h-full" ref={scrollAreaRef}>
                    <div className="p-4 space-y-4">
                        {mockMessages.map((msg) => (
                            <MessageBubble key={msg.id} message={msg} isOwnMessage={msg.senderId === myId} />
                        ))}
                    </div>
                </ScrollArea>
            </div>

            <div className="flex items-center gap-2 border-t p-2 bg-background sticky bottom-0">
                <Input placeholder="Type a message..." className="flex-1" />
                <Button className="bg-primary hover:bg-primary/90">
                    <Send className="h-5 w-5 mr-2" />
                    Send
                </Button>
            </div>
        </div>
    );
}
