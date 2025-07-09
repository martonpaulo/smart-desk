import { useEffect, useMemo } from 'react';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import type { SupabaseClient } from '@supabase/supabase-js';
import { useSession } from 'next-auth/react';

let client: SupabaseClient | null = null;

function initClient() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }
  return client;
}

export function useSupabaseClient(): SupabaseClient {
  const { data: session } = useSession();

  const supabase = useMemo(() => initClient(), []);

  useEffect(() => {
    // Attach NextAuth access token so RLS policies can identify the user
    if (session?.accessToken) {
      supabase.auth.setAuth(session.accessToken as string);
    } else {
      supabase.auth.signOut();
    }
  }, [session?.accessToken, supabase]);

  return supabase;
}
