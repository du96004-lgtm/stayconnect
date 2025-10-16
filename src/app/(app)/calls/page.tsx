'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone, Video, ArrowUpRight, ArrowDownLeft, PhoneCall } from "lucide-react";
import type { Call } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase";
import { ref, onValue, off } from "firebase/database";

const CallStatusIcon = ({ status }: { status: Call['status']}) => {
    const isMissedOrRejected = status === 'missed' || status === 'rejected';
    const color = isMissedOrRejected ? "text-destructive" : "text-muted-foreground";

    if (status === 'outgoing') return <ArrowUpRight className={cn("h-4 w-4", color)} />;
    if (status === 'answered') return <ArrowDownLeft className={cn("h-4 w-4", color)} />;
    
    // For missed and rejected incoming calls
    return <ArrowDownLeft className={cn("h-4 w-4", color)} />;
};

export default function CallsPage() {
    const { appUser } = useAuth();
    const [callHistory, setCallHistory] = useState<Call[]>([]);

    useEffect(() => {
        if (!appUser) return;

        const historyRef = ref(db, `callHistory/${appUser.uid}`);
        const listener = onValue(historyRef, (snapshot) => {
            if(snapshot.exists()) {
                const historyData = snapshot.val();
                const historyList: Call[] = Object.values(historyData);
                historyList.sort((a,b) => b.date - a.date);
                setCallHistory(historyList);
            } else {
                setCallHistory([]);
            }
        });

        return () => off(historyRef, 'value', listener);

    }, [appUser]);

    return (
        <div className="p-4">
             {callHistory.length > 0 ? (
                <div className="space-y-3">
                    {callHistory.map((call) => (
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
