import type { SupabaseClient } from '@supabase/supabase-js';

import { useUserStore } from '@/store/userStore';

export async function fetchUserId(client: SupabaseClient): Promise<string | null> {
  const store = useUserStore.getState();
  if (store.id) return store.id;

  const {
    data: { user },
    error,
  } = await client.auth.getUser();

  if (error || !user?.id) {
    console.error('fetchUserId failed', error);
    return null;
  }

  store.setUserId(user.id);
  return user.id;
}
