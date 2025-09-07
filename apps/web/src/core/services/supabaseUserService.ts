import { TypedSupabaseClient } from 'src/legacy/lib/supabaseClient';
import { useUserStore } from 'src/legacy/store/userStore';

export async function fetchUserId(client: TypedSupabaseClient): Promise<string | null> {
  const store = useUserStore.getState();
  if (store.id) return store.id;

  const { data, error } = await client.auth.getUser();
  if (error) {
    console.error('Error fetching user ID:', error);
    return null;
  }

  return data?.user?.id ?? null;
}
