'use client';

import { ReactNode, useEffect } from 'react';

import { GoogleAuthProvider, signInWithCredential, signOut } from 'firebase/auth';
import { useSession } from 'next-auth/react';

import { auth } from '@/services/firebase';

interface FirebaseAuthProviderProps {
  children: ReactNode;
}

export function FirebaseAuthProvider({ children }: FirebaseAuthProviderProps) {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.accessToken) {
      const credential = GoogleAuthProvider.credential(null, session.accessToken);
      signInWithCredential(auth, credential).catch(err =>
        console.error('Firebase sign in failed', err),
      );
    } else {
      signOut(auth).catch(() => {});
    }
  }, [session]);

  return <>{children}</>;
}
