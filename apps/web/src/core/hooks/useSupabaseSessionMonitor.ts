'use client';

import { useEffect, useRef } from 'react';
import { useSession, signIn } from 'next-auth/react';

import { getSupabaseClient } from 'src/legacy/lib/supabaseClient';
import { useConnectivityStore } from 'src/core/store/useConnectivityStore';

/**
 * Monitors Supabase session status and updates the connectivity store.
 * Handles session expiration, reconnection, and error states.
 */
export function useSupabaseSessionMonitor() {
  const { data: session, status: authStatus } = useSession();
  const setSupabaseStatus = useConnectivityStore(s => s.setSupabaseStatus);
  const setConnectionError = useConnectivityStore(s => s.setConnectionError);

  // Track last reconnection attempt to prevent spam
  const lastReconnectAttempt = useRef<number>(0);
  const RECONNECT_COOLDOWN = 30000; // 30 seconds

  useEffect(() => {
    // Don't monitor if not authenticated
    if (authStatus !== 'authenticated' || !session?.idToken) {
      setSupabaseStatus('disconnected');
      return;
    }

    let isActive = true;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const checkSession = async () => {
      if (!isActive) return;

      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.auth.getSession();

        if (!isActive) return;

        if (error) {
          console.warn('Supabase session check failed:', error);
          setSupabaseStatus('error');
          setConnectionError('auth_failed');
          return;
        }

        if (!data.session) {
          console.warn('Supabase session not found, attempting to reconnect...');
          setSupabaseStatus('disconnected');
          setConnectionError('session_expired');

          // Only attempt reconnection if we have a valid NextAuth session
          if (authStatus !== 'authenticated' || !session?.idToken) {
            console.warn('Cannot reconnect: NextAuth session not available');
            setSupabaseStatus('expired');
            setConnectionError('session_expired');
            return;
          }

          // Check if we're in cooldown period
          const now = Date.now();
          if (now - lastReconnectAttempt.current < RECONNECT_COOLDOWN) {
            console.log('Reconnection in cooldown, skipping...');
            return;
          }

          // Attempt to reconnect using the NextAuth session
          try {
            lastReconnectAttempt.current = now;
            if (!session.idToken) {
              throw new Error('No ID token available for reconnection');
            }

            // Check if the ID token is still valid (basic validation)
            try {
              const tokenParts = session.idToken.split('.');
              if (tokenParts.length !== 3) {
                throw new Error('Invalid token format');
              }

              const payload = JSON.parse(atob(tokenParts[1]));
              const now = Math.floor(Date.now() / 1000);

              if (payload.exp && payload.exp < now) {
                throw new Error('ID token has expired');
              }
            } catch (tokenError) {
              console.warn('ID token validation failed:', tokenError);
              setSupabaseStatus('expired');
              setConnectionError('session_expired');

              // If the ID token is invalid, we need to refresh the NextAuth session
              console.log('Attempting to refresh NextAuth session...');
              try {
                await signIn('google', { redirect: false });
              } catch (refreshError) {
                console.error('Failed to refresh NextAuth session:', refreshError);
              }
              return;
            }

            const { error: signInError } = await supabase.auth.signInWithIdToken({
              provider: 'google',
              token: session.idToken,
            });

            if (!isActive) return;

            if (signInError) {
              console.error('Failed to reconnect to Supabase:', signInError);

              // Handle specific error types
              if (
                signInError.message?.includes('Bad ID token') ||
                signInError.message?.includes('Invalid token') ||
                signInError.message?.includes('expired')
              ) {
                setSupabaseStatus('expired');
                setConnectionError('session_expired');
              } else {
                setSupabaseStatus('error');
                setConnectionError('auth_failed');
              }
            } else {
              console.log('Successfully reconnected to Supabase');
              setSupabaseStatus('connected');
              setConnectionError(null);
            }
          } catch (reconnectError) {
            console.error('Reconnection attempt failed:', reconnectError);
            setSupabaseStatus('error');
            setConnectionError('auth_failed');
          }
        } else {
          // Session is valid
          setSupabaseStatus('connected');
          setConnectionError(null);
        }
      } catch (error) {
        if (!isActive) return;

        console.error('Session monitoring error:', error);
        setSupabaseStatus('error');
        setConnectionError('server_error');
      }
    };

    // Initial check
    void checkSession();

    // Set up periodic monitoring
    const interval = setInterval(checkSession, 30000); // Check every 30 seconds

    // Listen for auth state changes
    const supabase = getSupabaseClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isActive) return;

      console.log('Supabase auth state changed:', event, !!session);

      switch (event) {
        case 'SIGNED_IN':
          setSupabaseStatus('connected');
          setConnectionError(null);
          break;
        case 'SIGNED_OUT':
          setSupabaseStatus('disconnected');
          setConnectionError('session_expired');
          break;
        case 'TOKEN_REFRESHED':
          setSupabaseStatus('connected');
          setConnectionError(null);
          break;
        case 'USER_UPDATED':
          // User updated, session should still be valid
          break;
        default:
          console.log('Unhandled auth event:', event);
      }
    });

    return () => {
      isActive = false;
      clearInterval(interval);
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      subscription.unsubscribe();
    };
  }, [authStatus, session?.idToken, setSupabaseStatus, setConnectionError]);
}
