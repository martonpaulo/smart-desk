import { useEffect, useMemo } from 'react';

import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import type { SupabaseClient } from '@supabase/supabase-js';
import { useSession } from 'next-auth/react';

let client: SupabaseClient | null = null;

function initClient(): SupabaseClient {
  if (!client) {
    client = createPagesBrowserClient({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    });
  }
  console.debug('Supabase client initialized');
  return client;
}

// Non-hook version for utilities outside React components
export function getSupabaseClient(): SupabaseClient {
  return initClient();
}

export function useSupabaseClient(): SupabaseClient {
  const { data: session } = useSession();

  const supabase = useMemo(() => initClient(), []);

  useEffect(() => {
    async function syncAuth() {
      if (session?.idToken) {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          const { error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: session.idToken as string,
          });
          if (error) {
            console.error('Supabase sign-in failed', error);
          }
        }
      } else {
        await supabase.auth.signOut();
      }
    }

    void syncAuth();
  }, [session?.idToken, supabase]);

  return supabase;
}
