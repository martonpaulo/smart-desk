import { fetchUserId } from '@/core/services/supabaseUserService';
import { getSupabaseClient } from '@/legacy/lib/supabaseClient';
import { useUserStore } from '@/legacy/store/userStore';

export async function signInWithGoogle(): Promise<void> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
  if (error) {
    console.error('Supabase Google sign in failed', error);
  } else if (data?.url) {
    window.open(data.url, '_blank');
  }
}

export async function signInWithIdToken(idToken: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
  });
  if (error) {
    console.error('Supabase ID token sign in failed', error);
    return;
  }

  await fetchUserId(supabase);
}

export async function signOutSupabase(): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Supabase sign out failed', error);
    return;
  }

  useUserStore.getState().setUserId(null);
}

export async function isSupabaseLoggedIn(): Promise<boolean> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Supabase session check failed', error);
    return false;
  }
  const loggedIn = !!data.session;
  console.debug('Supabase session present:', loggedIn);
  return loggedIn;
}
