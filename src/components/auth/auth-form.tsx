'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { ref, set, get, child } from 'firebase/database';
import { auth, db, googleProvider } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, MessageSquare } from 'lucide-react';
import type { AppUser } from '@/lib/types';

const formSchema = z.object({
  displayName: z.string().optional(),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type AuthFormValues = z.infer<typeof formSchema>;

const generatePublicId = async (): Promise<string> => {
    let id: string;
    let isUnique = false;
    const dbRef = ref(db);
  
    while (!isUnique) {
      id = Math.floor(10000 + Math.random() * 90000).toString();
      const snapshot = await get(child(dbRef, `publicIds/${id}`));
      if (!snapshot.exists()) {
        isUnique = true;
      }
    }
    return id;
};
  
const createUserProfile = async (user: FirebaseUser, displayName?: string) => {
    const publicId = await generatePublicId();
    const newUser: AppUser = {
      uid: user.uid,
      email: user.email,
      displayName: displayName || user.displayName || 'New User',
      avatarUrl: user.photoURL || `https://api.dicebear.com/8.x/initials/svg?seed=${displayName || user.email}`,
      publicId: publicId,
    };
  
    await set(ref(db, `users/${user.uid}`), newUser);
    await set(ref(db, `publicIds/${publicId}`), user.uid);
};
  

export default function AuthForm({ type }: { type: 'login' | 'register' }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setGoogleIsLoading] = useState(false);

  const isLogin = type === 'login';

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      displayName: '',
    },
  });

  const onSubmit = async (values: AuthFormValues) => {
    setIsLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, values.email, values.password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
        await updateProfile(userCredential.user, { displayName: values.displayName });
        await createUserProfile(userCredential.user, values.displayName);
      }
      toast({ title: isLogin ? 'Login successful!' : 'Registration successful!', description: 'Redirecting...' });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: error.message || 'An unknown error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleIsLoading(true);
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        const userRef = ref(db, `users/${user.uid}`);
        const snapshot = await get(userRef);
        if (!snapshot.exists()) {
          await createUserProfile(user);
        }
        toast({ title: 'Google Sign-In successful!', description: 'Redirecting...' });
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Google Sign-In Failed',
          description: error.message || 'An unknown error occurred.',
        });
      } finally {
        setGoogleIsLoading(false);
      }
  }

  return (
    <Card className="w-full max-w-sm shadow-2xl border-none">
      <CardHeader className="text-center">
        <div className="mx-auto bg-primary text-primary-foreground p-3 rounded-full mb-4 w-fit">
            <MessageSquare className="h-8 w-8" />
        </div>
        <CardTitle className="text-3xl font-bold">{isLogin ? 'Welcome Back!' : 'Create an Account'}</CardTitle>
        <CardDescription>{isLogin ? 'Sign in to connect with your friends.' : 'Join StayConnect today.'}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!isLogin && (
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input placeholder="you@example.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLogin ? 'Log In' : 'Register'}
            </Button>
          </form>
        </Form>
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>
        <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isGoogleLoading}>
          {isGoogleLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.2 74.9C307.4 104.5 279.8 88 248 88c-73.2 0-132.3 59.8-132.3 133.3s59.1 133.3 132.3 133.3c78.8 0 110.3-59.1 113.8-90.4H248v-66.3h239.1c1.5 13.5 2.4 28.5 2.4 43.8z"></path></svg>
          )}
          Google
        </Button>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <Link href={isLogin ? '/register' : '/login'} className="ml-1 font-semibold text-primary hover:underline">
            {isLogin ? 'Sign Up' : 'Log In'}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
