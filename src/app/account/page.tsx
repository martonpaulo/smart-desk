'use client';

import { Alert, Button, CircularProgress, Stack } from '@mui/material';

import { PageContentLayout } from '@/components/PageContentLayout';
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
      </Stack>
    </PageContentLayout>
  );
}
