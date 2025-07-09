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
  return client;
}

export function useSupabaseClient(): SupabaseClient {
  const { data: session } = useSession();

  const supabase = useMemo(() => initClient(), []);

  useEffect(() => {
    // Attach NextAuth access token so RLS policies can identify the user
    if (session?.accessToken) {
      // Use the global.auth.setSession method instead of deprecated setAuth
      supabase.auth.setSession({
        access_token: session.accessToken as string,
        refresh_token: '',
      });
    } else {
      supabase.auth.signOut();
    }
  }, [session?.accessToken, supabase]);

  return supabase;
}
