'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { FriendRequest } from "@/lib/types";
import { Users } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const initialMockRequests: FriendRequest[] = [];

export default function RequestsPage() {
    const [requests, setRequests] = useState<FriendRequest[]>(initialMockRequests);
    const { toast } = useToast();

    const handleRequest = (requestId: string, accepted: boolean) => {
        const request = requests.find(r => r.uid === requestId);
        if (!request) return;

        // In a real app, you'd call your backend here.
        setRequests(prevRequests => prevRequests.filter(r => r.uid !== requestId));

        toast({
            title: accepted ? "Friend Added!" : "Request Rejected",
            description: accepted ? `You are now friends with ${request.displayName}.` : `You have rejected ${request.displayName}'s friend request.`,
        });
    };

    return (
        <div className="p-4">
            {requests.length > 0 ? (
                <div className="space-y-3">
                    {requests.map((req) => (
                        <Card key={req.uid} className="bg-card">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={req.avatarUrl || ''} />
                                        <AvatarFallback>{req.displayName?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-semibold">{req.displayName}</h3>
                                        <p className="text-sm text-muted-foreground">Wants to be your friend</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={() => handleRequest(req.uid, true)}>Accept</Button>
                                    <Button size="sm" variant="outline" onClick={() => handleRequest(req.uid, false)}>Reject</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground mt-20 h-full">
                    <Users className="h-16 w-16 mb-4"/>
                    <h2 className="text-xl font-semibold">No new requests</h2>
                    <p className="max-w-xs">You have no pending friend requests at the moment.</p>
                </div>
            )}
        </div>
    );
}
