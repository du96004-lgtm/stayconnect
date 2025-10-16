'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { FriendRequest } from "@/lib/types";
import { Users } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase";
import { ref, onValue, off, remove, set } from "firebase/database";

export default function RequestsPage() {
    const [requests, setRequests] = useState<FriendRequest[]>([]);
    const { toast } = useToast();
    const { appUser } = useAuth();

    useEffect(() => {
        if (!appUser) return;

        const requestsRef = ref(db, `friendRequests/${appUser.uid}`);
        const listener = onValue(requestsRef, (snapshot) => {
            if (snapshot.exists()) {
                const requestsData = snapshot.val();
                const requestsList: FriendRequest[] = Object.values(requestsData);
                setRequests(requestsList);
            } else {
                setRequests([]);
            }
        });

        return () => {
            off(requestsRef, 'value', listener);
        };
    }, [appUser]);

    const handleRequest = async (request: FriendRequest, accepted: boolean) => {
        if (!appUser) return;

        const senderUid = request.uid;
        const recipientUid = appUser.uid;

        // Remove the request from the friendRequests node
        await remove(ref(db, `friendRequests/${recipientUid}/${senderUid}`));

        if (accepted) {
            // Add to each user's friends list
            const friendDataForRecipient = {
                uid: senderUid,
                displayName: request.displayName,
                avatarUrl: request.avatarUrl,
            };
            const friendDataForSender = {
                uid: recipientUid,
                displayName: appUser.displayName,
                avatarUrl: appUser.avatarUrl,
            };
            
            await set(ref(db, `friends/${recipientUid}/${senderUid}`), friendDataForRecipient);
            await set(ref(db, `friends/${senderUid}/${recipientUid}`), friendDataForSender);
            
            toast({
                title: "Friend Added!",
                description: `You are now friends with ${request.displayName}.`,
            });
        } else {
            toast({
                title: "Request Rejected",
                description: `You have rejected ${request.displayName}'s friend request.`,
            });
        }
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
                                    <Button size="sm" onClick={() => handleRequest(req, true)}>Accept</Button>
                                    <Button size="sm" variant="outline" onClick={() => handleRequest(req, false)}>Reject</Button>
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
