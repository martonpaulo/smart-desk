import { Alert, AlertColor, Button, CircularProgress, Stack } from '@mui/material';

export interface AuthControlProps {
  severity: AlertColor;
  message: string;
  isLoading: boolean;
  canSignIn: boolean;
  canSignOut: boolean;
  handleSignIn: () => Promise<void>;
  handleSignOut: () => Promise<void>;
}

export function AuthControl({
  severity,
  message,
  isLoading,
  canSignIn,
  canSignOut,
  handleSignIn,
  handleSignOut,
}: AuthControlProps) {
  return (
    <Stack spacing={2} alignItems="center" justifyContent="center">
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
    </Stack>
  );
}
