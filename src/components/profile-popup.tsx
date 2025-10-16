'use client';

import React from 'react';
import QRCode from 'qrcode.react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { LogOut, Edit, Copy, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePopup({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: (open: boolean) => void }) {
  const { appUser, logout } = useAuth();
  const { toast } = useToast();

  const handleCopyId = () => {
    if (appUser?.publicId) {
      navigator.clipboard.writeText(appUser.publicId);
      toast({
        title: 'Copied!',
        description: 'Your user ID has been copied to the clipboard.',
      });
    }
  };
  
  const handleShare = () => {
    if (appUser?.publicId) {
        if(navigator.share) {
            navigator.share({
                title: 'StatConnect Profile',
                text: `Add me on StatConnect! My ID is: ${appUser.publicId}`,
            }).catch(console.error);
        } else {
            handleCopyId();
        }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-0 gap-0">
        <div className="flex flex-col items-center p-6 bg-secondary/30">
          <Avatar className="h-24 w-24 border-4 border-background shadow-md">
            <AvatarImage src={appUser?.avatarUrl || ''} alt={appUser?.displayName || 'User'} />
            <AvatarFallback className="text-4xl">
              {appUser?.displayName?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <h2 className="mt-4 text-2xl font-bold">{appUser?.displayName}</h2>
          <p className="text-muted-foreground">{appUser?.email}</p>
          <div className="mt-2 flex items-center gap-2 rounded-full bg-background px-3 py-1">
            <span className="font-mono text-sm font-medium">ID: {appUser?.publicId}</span>
            <Button onClick={handleCopyId} variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="p-6 flex flex-col items-center gap-4">
            <div className='p-2 bg-white rounded-lg shadow-md'>
                <QRCode value={`statconnect_user_id:${appUser?.publicId}` || ''} size={128} />
            </div>
            <p className='text-sm text-muted-foreground text-center'>Scan this code to add as a friend.</p>
        </div>
        <div className="grid grid-cols-3 gap-2 p-2 border-t">
          <Button variant="ghost" className="flex-col h-auto p-2">
            <Edit className="h-5 w-5" />
            <span className="text-xs mt-1">Edit</span>
          </Button>
          <Button variant="ghost" className="flex-col h-auto p-2" onClick={handleShare}>
            <Share2 className="h-5 w-5" />
            <span className="text-xs mt-1">Share</span>
          </Button>
          <Button variant="ghost" className="flex-col h-auto p-2 text-destructive hover:text-destructive" onClick={logout}>
            <LogOut className="h-5 w-5" />
            <span className="text-xs mt-1">Logout</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
