'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { FriendRequest } from "@/lib/types";
import { Users } from "lucide-react";

const mockRequests: FriendRequest[] = [
    { uid: '4', displayName: 'Diana', avatarUrl: 'https://picsum.photos/seed/request1/200' },
    { uid: '5', displayName: 'Eve', avatarUrl: 'https://picsum.photos/seed/request2/200' },
];

export default function RequestsPage() {
    return (
        <div className="p-4">
            {mockRequests.length > 0 ? (
                <div className="space-y-3">
                    {mockRequests.map((req) => (
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
                                    <Button size="sm">Accept</Button>
                                    <Button size="sm" variant="outline">Reject</Button>
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
