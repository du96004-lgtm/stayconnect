'use client';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase";
import { ref, get, child, set } from "firebase/database";

export default function AddFriendPopup({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: (open: boolean) => void; }) {
    const [userId, setUserId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { appUser } = useAuth();

    const handleAddFriend = async () => {
        if (!appUser) {
            toast({ variant: 'destructive', title: 'Not logged in', description: 'You must be logged in to add friends.' });
            return;
        }

        if (userId.length !== 5 || !/^\d+$/.test(userId)) {
            toast({ variant: 'destructive', title: 'Invalid ID', description: 'User ID must be a 5-digit number.' });
            return;
        }
        
        if (userId === appUser.publicId) {
            toast({ variant: 'destructive', title: 'Invalid ID', description: "You can't add yourself as a friend." });
            return;
        }


        setIsLoading(true);
        try {
            const dbRef = ref(db);
            const publicIdSnapshot = await get(child(dbRef, `publicIds/${userId}`));

            if (!publicIdSnapshot.exists()) {
                toast({ variant: 'destructive', title: 'User Not Found', description: `No user found with the ID ${userId}.` });
                setIsLoading(false);
                return;
            }

            const recipientUid = publicIdSnapshot.val();

            // Check if a request already exists
            const existingRequestSnapshot = await get(child(dbRef, `friendRequests/${recipientUid}/${appUser.uid}`));
            if (existingRequestSnapshot.exists()) {
                toast({ variant: 'destructive', title: 'Request Already Sent', description: `You have already sent a friend request to this user.` });
                setIsLoading(false);
                return;
            }
            
            // Check if they are already friends
            const existingFriendSnapshot = await get(child(dbRef, `friends/${appUser.uid}/${recipientUid}`));
            if(existingFriendSnapshot.exists()) {
                toast({ variant: 'destructive', title: 'Already Friends', description: `You are already friends with this user.` });
                setIsLoading(false);
                return;
            }

            const requestData = {
                uid: appUser.uid,
                displayName: appUser.displayName,
                avatarUrl: appUser.avatarUrl,
                timestamp: Date.now(),
            };

            await set(ref(db, `friendRequests/${recipientUid}/${appUser.uid}`), requestData);

            toast({ title: 'Request Sent!', description: `Your friend request to user ${userId} has been sent.` });
            onOpenChange(false);
            setUserId('');

        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message || 'An unexpected error occurred.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!isLoading) {
                onOpenChange(open);
                setUserId('');
            }
        }}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Friend</DialogTitle>
                    <DialogDescription>
                        Enter the 5-digit User ID of the person you want to add.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="userId" className="text-right">
                            User ID
                        </Label>
                        <Input
                            id="userId"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value.replace(/\D/g, ''))}
                            className="col-span-3"
                            maxLength={5}
                            placeholder="e.g. 12345"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleAddFriend} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Send Request
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
