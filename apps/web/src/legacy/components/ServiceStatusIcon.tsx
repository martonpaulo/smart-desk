import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

import CheckIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HelpIcon from '@mui/icons-material/HelpOutline';
import { getSupabaseClient } from 'src/legacy/lib/supabaseClient';

type Status = 'ok' | 'error' | 'pending';
type Service = 'google' | 'supabase';

export function ServiceStatusIcon({ service }: { service: Service }) {
  const { status: googleStatus } = useSession();
  const [supabaseStatus, setSupabaseStatus] = useState<Status>('pending');

  useEffect(() => {
    if (service !== 'supabase') return;
    const checkSupabase = async () => {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) setSupabaseStatus('error');
      else setSupabaseStatus('ok');
    };
    void checkSupabase();
  }, [service]);

  const getStatus = (): Status => {
    if (service === 'google') {
      if (googleStatus === 'authenticated') return 'ok';
      if (googleStatus === 'loading') return 'pending';
      return 'error';
    }

    if (service === 'supabase') {
      return supabaseStatus;
    }

    return 'pending';
  };

  const status = getStatus();

  if (status === 'ok') return <CheckIcon color="success" fontSize="small" />;
  if (status === 'error') return <ErrorIcon color="error" fontSize="small" />;
  return <HelpIcon color="disabled" fontSize="small" />;
}
