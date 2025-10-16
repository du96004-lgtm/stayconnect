'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone, Video, PhoneMissed, ArrowUpRight, ArrowDownLeft, PhoneCall } from "lucide-react";
import type { Call } from "@/lib/types";
import { cn } from "@/lib/utils";

const mockCalls: Call[] = [
    { id: 'call1', contactName: 'Alice', contactAvatar: 'https://picsum.photos/seed/call1/200', date: Date.now() - 1000 * 60 * 15, type: 'video', status: 'answered' },
    { id: 'call2', contactName: 'Bob', contactAvatar: 'https://picsum.photos/seed/call2/200', date: Date.now() - 1000 * 60 * 60 * 3, type: 'audio', status: 'missed' },
    { id: 'call3', contactName: 'Alice', contactAvatar: 'https://picsum.photos/seed/call1/200', date: Date.now() - 1000 * 60 * 60 * 24, type: 'audio', status: 'outgoing' },
    { id: 'call4', contactName: 'Charlie', contactAvatar: 'https://picsum.photos/seed/call3/200', date: Date.now() - 1000 * 60 * 60 * 48, type: 'video', status: 'rejected' },
];

const CallStatusIcon = ({ status }: { status: Call['status']}) => {
    const isMissedOrRejected = status === 'missed' || status === 'rejected';
    const color = isMissedOrRejected ? "text-destructive" : "text-muted-foreground";

    if (status === 'outgoing') return <ArrowUpRight className={cn("h-4 w-4", color)} />;
    if (status === 'answered') return <ArrowDownLeft className={cn("h-4 w-4", color)} />;
    
    // For missed and rejected incoming calls
    return <ArrowDownLeft className={cn("h-4 w-4", color)} />;
};

export default function CallsPage() {
    return (
        <div className="p-4">
             {mockCalls.length > 0 ? (
                <div className="space-y-3">
                    {mockCalls.map((call) => (
                        <Card key={call.id}>
                            <CardContent className="p-3 flex items-center gap-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={call.contactAvatar || ''} />
                                    <AvatarFallback>{call.contactName?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <h3 className={cn("font-semibold", (call.status === 'missed' || call.status === 'rejected') && 'text-destructive')}>
                                        {call.contactName}
                                    </h3>
                                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                        <CallStatusIcon status={call.status}/>
                                        <span>{new Date(call.date).toLocaleString()}</span>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon">
                                    {call.type === 'video' ? <Video className="h-5 w-5 text-primary" /> : <Phone className="h-5 w-5 text-primary" />}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground mt-20 h-full">
                    <PhoneCall className="h-16 w-16 mb-4"/>
                    <h2 className="text-xl font-semibold">No recent calls</h2>
                    <p className="max-w-xs">Your call history will appear here.</p>
                </div>
            )}
        </div>
    );
}
