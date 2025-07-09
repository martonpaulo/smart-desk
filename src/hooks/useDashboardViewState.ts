import { signIn, signOut, useSession } from 'next-auth/react';
import {
  signInWithGoogle as supabaseSignIn,
  signOutSupabase,
} from '@/hooks/useSupabaseAuth';

import { useEvents } from '@/hooks/useEvents';
import { useEventStore } from '@/store/eventStore';
import { DashboardViewState } from '@/types/DashboardViewState';
import { displayError } from '@/utils/errorUtils';

export function useDashboardViewState(): DashboardViewState {
  const { status: authStatus } = useSession();
  const { isLoading: loadingEvents, isError: eventsFailed, error: rawError } = useEvents();
  const events = useEventStore(state => state.events);

  const handleSignIn = async () => {
    try {
      const res = await signIn('google', { redirect: false });
      if (res?.url) window.open(res.url, '_blank');
      await supabaseSignIn();
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
      showEvents: false,
      events: null,
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
      showEvents: false,
      events: null,
      handleSignIn,
      handleSignOut,
    };
  }

  if (loadingEvents) {
    return {
      severity: 'info',
      message: 'Fetching your events…',
      isLoading: true,
      canSignIn: false,
      canSignOut: true,
      showEvents: false,
      events: null,
      handleSignIn,
      handleSignOut,
    };
  }

  if (eventsFailed) {
    const errorMsg = displayError({ prefix: 'Error fetching events', error: rawError });
    return {
      severity: 'error',
      message: errorMsg,
      isLoading: false,
      canSignIn: false,
      canSignOut: true,
      showEvents: false,
      events: null,
      handleSignIn,
      handleSignOut,
    };
  }

  if (events == null) {
    return {
      severity: 'warning',
      message: 'No events data received. Try refreshing.',
      isLoading: false,
      canSignIn: false,
      canSignOut: true,
      showEvents: false,
      events: null,
      handleSignIn,
      handleSignOut,
    };
  }

  if (!Array.isArray(events)) {
    return {
      severity: 'error',
      message: 'Invalid events format. Contact support.',
      isLoading: false,
      canSignIn: false,
      canSignOut: true,
      showEvents: false,
      events: null,
      handleSignIn,
      handleSignOut,
    };
  }

  if (events.length === 0) {
    return {
      severity: 'info',
      message: 'No events found for today.',
      isLoading: false,
      canSignIn: false,
      canSignOut: true,
      showEvents: true,
      events: [],
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
    showEvents: true,
    events,
    handleSignIn,
    handleSignOut,
  };
}
