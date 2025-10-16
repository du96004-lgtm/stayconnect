'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { ref, onValue, off, update, serverTimestamp, set } from 'firebase/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { AnimatePresence, motion } from 'framer-motion';

type CallDetails = {
    id: string;
    type: 'audio' | 'video';
    caller: { uid: string; displayName: string; avatarUrl: string };
    status: 'initiating' | 'ringing' | 'connected' | 'ended' | 'rejected' | 'missed';
};

export default function IncomingCallManager() {
  const { appUser } = useAuth();
  const router = useRouter();
  const [incomingCall, setIncomingCall] = useState<CallDetails | null>(null);

  useEffect(() => {
    if (!appUser) return;

    const callsRef = ref(db, 'calls');
    const listener = onValue(callsRef, (snapshot) => {
      let foundCall: CallDetails | null = null;
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const call = childSnapshot.val();
          if (call.recipient.uid === appUser.uid && call.status === 'initiating') {
            foundCall = call;
            // update status to ringing
            update(ref(db, `calls/${call.id}`), { status: 'ringing' });
            return; // break from forEach
          }
        });
      }
      setIncomingCall(foundCall);
    });

    return () => off(callsRef, 'value', listener);
  }, [appUser]);

  const handleAcceptCall = () => {
    if (!incomingCall) return;
    const callId = incomingCall.id;
    
    // Update call status
    update(ref(db, `calls/${callId}`), { status: 'connected' });
    
    // Update recipient's call history
    const historyRef = ref(db, `callHistory/${appUser?.uid}/${callId}`);
    update(historyRef, { status: 'answered', date: Date.now() });

    setIncomingCall(null);
    router.push(`/call/${callId}`);
  };

  const handleRejectCall = () => {
    if (!incomingCall) return;
    const callId = incomingCall.id;

    update(ref(db, `calls/${callId}`), { status: 'rejected' });
    
    const historyRef = ref(db, `callHistory/${appUser?.uid}/${callId}`);
    update(historyRef, { status: 'rejected', date: Date.now() });
    
    setIncomingCall(null);
  };
  
  return (
    <AnimatePresence>
        {incomingCall && (
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md z-50"
            >
                <Card className="shadow-2xl border-primary/20 bg-background/80 backdrop-blur-xl">
                    <CardHeader className="p-4">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-14 w-14">
                                <AvatarImage src={incomingCall.caller.avatarUrl} />
                                <AvatarFallback>{incomingCall.caller.displayName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-xl">{incomingCall.caller.displayName}</CardTitle>
                                <CardDescription>Incoming {incomingCall.type} call...</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 flex justify-end gap-3">
                        <Button variant="destructive" size="lg" className='rounded-full h-14 w-14' onClick={handleRejectCall}>
                            <PhoneOff />
                        </Button>
                        <Button variant="default" size="lg" className="rounded-full h-14 w-14 bg-green-500 hover:bg-green-600" onClick={handleAcceptCall}>
                           {incomingCall.type === 'video' ? <Video /> : <Phone />}
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
        )}
    </AnimatePresence>
  );
}
