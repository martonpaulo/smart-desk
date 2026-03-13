import { createClient } from '@supabase/supabase-js';

// Server-only — uses the Supabase secret key which bypasses Row Level Security.
// Never import this module from client-side code.
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is missing.');
  }

  if (!secretKey) {
    throw new Error('SUPABASE_SECRET_KEY is missing.');
  }

  return createClient(supabaseUrl, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
