'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { ref, onValue, off, update } from 'firebase/database';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { AnimatePresence, motion } from 'framer-motion';

type CallDetails = {
    id: string;
    type: 'audio' | 'video';
    caller: { uid: string; displayName: string; avatarUrl: string };
    status: 'initiating' | 'ringing' | 'connecting' | 'connected' | 'ended' | 'rejected' | 'missed';
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
      snapshot.forEach((childSnapshot) => {
        const call = childSnapshot.val();
        if (call.recipient.uid === appUser.uid && (call.status === 'initiating' || call.status === 'ringing')) {
            foundCall = call;
            if(call.status === 'initiating') {
                update(ref(db, `calls/${call.id}`), { status: 'ringing' });
            }
          return;
        }
        if(call.id === incomingCall?.id && (call.status === 'missed' || call.status === 'ended')) {
            setIncomingCall(null);
        }
      });
      setIncomingCall(foundCall);
    });

    return () => off(callsRef, 'value', listener);
  }, [appUser, incomingCall?.id]);

  const handleAcceptCall = () => {
    if (!incomingCall || !appUser) return;
    const callId = incomingCall.id;
    
    update(ref(db, `calls/${callId}`), { status: 'connecting' });
    
    const historyRef = ref(db, `callHistory/${appUser.uid}/${callId}`);
    update(historyRef, { status: 'answered', date: Date.now() });

    router.push(`/call/${callId}`);
    setIncomingCall(null);
  };

  const handleRejectCall = () => {
    if (!incomingCall || !appUser) return;
    const callId = incomingCall.id;

    update(ref(db, `calls/${callId}`), { status: 'rejected' });
    
    const historyRef = ref(db, `callHistory/${appUser.uid}/${callId}`);
    update(historyRef, { status: 'rejected', date: Date.now() });
    
    setIncomingCall(null);
  };
  
  return (
    <AnimatePresence>
        {incomingCall && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-gray-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-white p-4"
            >
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                    className="flex flex-col items-center text-center"
                >
                    <Avatar className="h-32 w-32 border-4 border-white/20 mb-6">
                        <AvatarImage src={incomingCall.caller.avatarUrl} />
                        <AvatarFallback className="text-5xl bg-gray-700">{incomingCall.caller.displayName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h1 className="text-4xl font-bold">{incomingCall.caller.displayName}</h1>
                    <p className="text-lg mt-2 text-gray-300">Incoming {incomingCall.type} call...</p>
                </motion.div>

                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-8">
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.3 }}
                    >
                        <div className="flex flex-col items-center">
                            <Button variant="destructive" size="icon" className="h-20 w-20 rounded-full" onClick={handleRejectCall}>
                                <PhoneOff className="h-10 w-10" />
                            </Button>
                            <span className="mt-2 text-sm">Decline</span>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.3 }}
                    >
                         <div className="flex flex-col items-center">
                            <Button size="icon" className="h-20 w-20 rounded-full bg-green-500 hover:bg-green-600" onClick={handleAcceptCall}>
                               {incomingCall.type === 'video' ? <Video className="h-10 w-10" /> : <Phone className="h-10 w-10" />}
                            </Button>
                            <span className="mt-2 text-sm">Accept</span>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
  );
}
