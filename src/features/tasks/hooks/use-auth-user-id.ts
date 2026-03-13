import { useEffect, useMemo, useState } from 'react';

import { getSupabaseBrowserClient } from '@/lib/supabase-browser';

export function useAuthUserId() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    void supabase.auth
      .getUser()
      .then(({ data }) => {
        if (!isMounted) {
          return;
        }

        setUserId(data.user?.id ?? null);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) {
        return;
      }

      setUserId(session?.user.id ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return {
    userId,
    isLoading,
  };
}
