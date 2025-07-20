'use client';

import { Alert, Button, CircularProgress, Stack, Typography } from '@mui/material';

import { PageContentLayout } from '@/components/PageContentLayout';
import { ServiceStatusIcon } from '@/components/ServiceStatusIcon';
import { useDashboardViewState } from '@/hooks/useDashboardViewState';

export default function AccountPage() {
  const { severity, message, isLoading, canSignIn, canSignOut, handleSignIn, handleSignOut } =
    useDashboardViewState();

  return (
    <PageContentLayout title="Account" description="Manage your account settings">
      {isLoading && <CircularProgress />}

      <Alert severity={severity}>{message}</Alert>

      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          onClick={handleSignIn}
          disabled={!canSignIn}
          aria-label="Sign in"
        >
          Sign in
        </Button>
        <Button
          variant="outlined"
          onClick={handleSignOut}
          disabled={!canSignOut}
          aria-label="Sign out"
        >
          Sign out
        </Button>

        <Stack spacing={1.5}>
          <Typography variant="h3">Connection Status</Typography>

          <Stack direction="row" alignItems="center" gap={0.5}>
            <Typography variant="body2">Google Calendar</Typography>
            <ServiceStatusIcon service="google" />
          </Stack>
          <Stack direction="row" alignItems="center" gap={0.5}>
            <Typography variant="body2">Supabase</Typography>
            <ServiceStatusIcon service="supabase" />
          </Stack>
        </Stack>
      </Stack>
    </PageContentLayout>
  );
}
