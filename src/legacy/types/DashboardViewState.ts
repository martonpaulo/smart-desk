import { AlertColor } from '@mui/material';

import { Event } from '@/legacy/types/Event';

export interface DashboardViewState {
  severity: AlertColor;
  message: string;
  isLoading: boolean;
  canSignIn: boolean;
  canSignOut: boolean;
  showEvents: boolean;
  events: Event[] | null;
  handleSignIn: () => Promise<void>;
  handleSignOut: () => Promise<void>;
}
