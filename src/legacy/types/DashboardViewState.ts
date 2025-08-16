import { AlertColor } from '@mui/material';

export interface DashboardViewState {
  severity: AlertColor;
  message: string;
  isLoading: boolean;
  canSignIn: boolean;
  canSignOut: boolean;
  handleSignIn: () => Promise<void>;
  handleSignOut: () => Promise<void>;
}
