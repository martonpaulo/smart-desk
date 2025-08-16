import { useEffect } from 'react';

import { signIn, signOut, useSession } from 'next-auth/react';

import {
  isSupabaseLoggedIn,
  signInWithIdToken as supabaseSignInWithIdToken,
  signOutSupabase,
} from '@/legacy/hooks/useSupabaseAuth';
import { DashboardViewState } from '@/legacy/types/DashboardViewState';
import { displayError } from '@/legacy/utils/errorUtils';

export function useDashboardViewState(): DashboardViewState {
  const { data: session, status: authStatus } = useSession();

  useEffect(() => {
    async function ensureSupabaseSession() {
      if (authStatus !== 'authenticated' || !session?.idToken) return;
      const loggedIn = await isSupabaseLoggedIn();
      if (!loggedIn) {
        await supabaseSignInWithIdToken(session.idToken);
      }
    }
    void ensureSupabaseSession();
  }, [authStatus, session]);

  const handleSignIn = async () => {
    try {
      const res = await signIn('google', { redirect: false });
      if (res?.url) window.open(res.url, '_blank');
      // Supabase sign in will be handled when session becomes available
    } catch (err) {
      displayError({ prefix: 'Error during sign in', error: err });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      await signOutSupabase();
    } catch (err) {
      displayError({ prefix: 'Error during sign out', error: err });
    }
  };

  if (authStatus === 'unauthenticated') {
    return {
      severity: 'warning',
      message: 'Not signed in. Log in to continue.',
      isLoading: false,
      canSignIn: true,
      canSignOut: false,
      handleSignIn,
      handleSignOut,
    };
  }

  if (authStatus === 'loading') {
    return {
      severity: 'info',
      message: 'Checking authentication…',
      isLoading: true,
      canSignIn: false,
      canSignOut: false,
      handleSignIn,
      handleSignOut,
    };
  }

  return {
    severity: 'success',
    message: 'Events loaded successfully.',
    isLoading: false,
    canSignIn: false,
    canSignOut: true,
    handleSignIn,
    handleSignOut,
  };
}
