import { useEffect, useState } from 'react';

import CheckIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HelpIcon from '@mui/icons-material/HelpOutline';
import { Stack, Typography } from '@mui/material';
import { useSession } from 'next-auth/react';

import { getSupabaseClient } from '@/lib/supabaseClient';

function StatusRow({ label, status }: { label: string; status: 'ok' | 'error' | 'pending' }) {
  const icon =
    status === 'ok' ? (
      <CheckIcon color="success" />
    ) : status === 'error' ? (
      <ErrorIcon color="error" />
    ) : (
      <HelpIcon color="disabled" />
    );

  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      {icon}
      <Typography>{label}</Typography>
    </Stack>
  );
}

export function AuthStatus() {
  const { status: googleStatus } = useSession();
  const [supabaseStatus, setSupabaseStatus] = useState<'ok' | 'error' | 'pending'>('pending');

  useEffect(() => {
    async function checkSupabase() {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        setSupabaseStatus('error');
      } else {
        setSupabaseStatus('ok');
      }
    }
    void checkSupabase();
  }, []);

  return (
    <Stack spacing={2}>
      <Typography variant="h3" gutterBottom>
        Connection Status
      </Typography>
      <StatusRow
        label="Google Calendar"
        status={
          googleStatus === 'authenticated' ? 'ok' : googleStatus === 'loading' ? 'pending' : 'error'
        }
      />
      <StatusRow label="Supabase" status={supabaseStatus} />
    </Stack>
  );
}

export default AuthStatus;
