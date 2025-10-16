'use client';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function AddFriendPopup({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: (open: boolean) => void; }) {
    const [userId, setUserId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleAddFriend = async () => {
        if (userId.length !== 5 || !/^\d+$/.test(userId)) {
            toast({ variant: 'destructive', title: 'Invalid ID', description: 'User ID must be a 5-digit number.' });
            return;
        }
        setIsLoading(true);
        // TODO: Firebase logic to find user and send friend request
        console.log(`Sending friend request to ${userId}`);
        await new Promise(res => setTimeout(res, 1500));
        setIsLoading(false);
        onOpenChange(false);
        setUserId('');
        toast({ title: 'Request Sent!', description: `Your friend request to user ${userId} has been sent.` });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
