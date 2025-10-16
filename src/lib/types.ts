import type { User as FirebaseUser } from 'firebase/auth';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  publicId: string;
}

export interface AuthContextType {
  user: FirebaseUser | null;
  appUser: AppUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName?: string; // For group chats
  text: string;
  timestamp: number;
}

export interface ChatFriend {
    uid: string;
    displayName: string | null;
    avatarUrl: string | null;
    online: boolean;
    lastMessage?: string;
    lastMessageTimestamp?: number;
}

export interface FriendRequest {
    uid: string;
    displayName: string | null;
    avatarUrl: string | null;
}

export interface Community {
    id: string;
    name: string;
    creator: string;
    memberCount: number;
}

export interface Call {
    id: string;
    contactName: string | null;
    contactAvatar: string | null;
    date: number;
    type: 'audio' | 'video';
    status: 'answered' | 'missed' | 'rejected' | 'outgoing';
}
