'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { ref, onValue, off } from 'firebase/database';
import { auth, db } from '@/lib/firebase';
import type { AppUser, AuthContextType } from '@/lib/types';
import { Loader2, MessageSquare } from 'lucide-react';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userRef = ref(db, `users/${firebaseUser.uid}`);
        onValue(userRef, (snapshot) => {
          if (snapshot.exists()) {
            setAppUser(snapshot.val());
          }
          setLoading(false);
        });

        return () => {
          if(userRef) {
            off(userRef);
          }
        }
      } else {
        setAppUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  const value = { user, appUser, loading, logout };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
           <div className="bg-primary text-primary-foreground p-4 rounded-full mb-4">
                <MessageSquare className="h-10 w-10" />
            </div>
          <h1 className="text-3xl font-bold text-primary">StayConnect</h1>
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
