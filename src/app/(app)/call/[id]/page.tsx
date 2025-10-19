'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Mic, MicOff, Video, VideoOff, Phone, ScreenShare } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { ref, onValue, off, update } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type CallDetails = {
    id: string;
    type: 'audio' | 'video';
    caller: { uid: string; displayName: string; avatarUrl: string };
    recipient: { uid: string; displayName: string; avatarUrl: string };
    status: 'initiating' | 'ringing' | 'connecting' | 'connected' | 'ended' | 'rejected' | 'missed';
};

export default function CallPage() {
    const { id: callId } = useParams();
    const { appUser } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    
    const [callDetails, setCallDetails] = useState<CallDetails | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [hasCameraPermission, setHasCameraPermission] = useState(false);
    
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (!callId || !appUser) return;
        const callRef = ref(db, `calls/${callId}`);

        const listener = onValue(callRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                setCallDetails(data);
                if ((data.status === 'ended' || data.status === 'rejected' || data.status === 'missed') && data.status !== callDetails?.status) {
                    toast({
                        title: `Call ${data.status}`,
                        description: `The call has been ${data.status}.`,
                    });
                    router.push('/home');
                }
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Call not found',
                    description: 'The call you are trying to join does not exist.',
                });
                router.push('/home');
            }
        });

        return () => off(callRef, 'value', listener);
    }, [callId, appUser, router, toast, callDetails?.status]);

    useEffect(() => {
        if (callDetails?.type !== 'video' || (callDetails.status !== 'connected' && callDetails.status !== 'connecting')) return;

        const getCameraPermission = async () => {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
            setHasCameraPermission(true);
    
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          } catch (error) {
            console.error('Error accessing camera:', error);
            setHasCameraPermission(false);
          }
        };
    
        getCameraPermission();

        return () => {
            if(videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        }
    }, [callDetails?.type, callDetails?.status]);

    const handleEndCall = () => {
        if (callId && appUser) {
            let newStatus: CallDetails['status'] = 'ended';
            if (callDetails?.status === 'ringing' || callDetails?.status === 'initiating' || callDetails?.status === 'connecting') {
                newStatus = callDetails.caller.uid === appUser.uid ? 'ended' : 'missed';
            }

            update(ref(db, `calls/${callId}`), { status: newStatus });
            
            // update caller history
            if(callDetails?.caller.uid) {
                const historyRef = ref(db, `callHistory/${callDetails?.caller.uid}/${callId}`);
                update(historyRef, { status: callDetails?.caller.uid === appUser.uid ? 'outgoing' : 'missed' });
            }

            // update recipient history
            if(callDetails?.recipient.uid) {
                const historyRef = ref(db, `callHistory/${callDetails?.recipient.uid}/${callId}`);
                update(historyRef, { status: newStatus === 'missed' ? 'missed' : 'answered' });
            }
        }
    };
    
    const otherParticipant = callDetails?.caller.uid === appUser?.uid ? callDetails?.recipient : callDetails?.caller;

    if (!callDetails) {
        return <div className="flex items-center justify-center h-screen bg-background">Loading...</div>;
    }

    return (
        <div className="h-screen w-full flex flex-col bg-gray-900 text-white relative">
            {(callDetails.type === 'video' && (callDetails.status === 'connected' || callDetails.status === 'connecting')) ? (
                 <video ref={videoRef} className="w-full h-full object-cover" autoPlay />
            ): (
                <div className="flex-1 flex flex-col items-center justify-center bg-gray-800">
                    <Avatar className="h-40 w-40 border-4 border-gray-600">
                        <AvatarImage src={otherParticipant?.avatarUrl} />
                        <AvatarFallback className="text-6xl bg-gray-700">{otherParticipant?.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h2 className="text-4xl font-bold mt-6">{otherParticipant?.displayName}</h2>
                    <p className="text-xl text-gray-400 mt-2 capitalize">{callDetails.status}...</p>
                </div>
            )}
            
            {!hasCameraPermission && callDetails.type === 'video' && (callDetails.status === 'connected' || callDetails.status === 'connecting') && (
                <div className="absolute top-4 left-4 right-4">
                    <Alert variant="destructive">
                      <AlertTitle>Camera Access Required</AlertTitle>
                      <AlertDescription>
                        Please allow camera access to use video calling.
                      </AlertDescription>
                    </Alert>
                </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-4 bg-black bg-opacity-50">
                <Card className="bg-gray-800 bg-opacity-70 border-none max-w-md mx-auto">
                    <CardContent className="p-4 flex justify-center items-center gap-4">
                        <Button variant="ghost" size="icon" className="h-16 w-16 rounded-full bg-white/20 hover:bg-white/30" onClick={() => setIsMuted(!isMuted)}>
                            {isMuted ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
                        </Button>
                        {callDetails.type === 'video' && (
                            <Button variant="ghost" size="icon" className="h-16 w-16 rounded-full bg-white/20 hover:bg-white/30" onClick={() => setIsCameraOff(!isCameraOff)}>
                                {isCameraOff ? <VideoOff className="h-8 w-8" /> : <Video className="h-8 w-8" />}
                            </Button>
                        )}
                         <Button variant="ghost" size="icon" className="h-16 w-16 rounded-full bg-white/20 hover:bg-white/30">
                            <ScreenShare className="h-8 w-8" />
                        </Button>
                        <Button variant="destructive" size="icon" className="h-16 w-16 rounded-full" onClick={handleEndCall}>
                            <Phone className="h-8 w-8" />
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
