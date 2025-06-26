import { AlertColor } from '@mui/material';

import { IEvent } from '@/types/IEvent';

export interface DashboardViewState {
  severity: AlertColor;
  message: string;
  isLoading: boolean;
  canSignIn: boolean;
  canSignOut: boolean;
  showEvents: boolean;
  events: IEvent[] | null;
  handleSignIn: () => Promise<void>;
  handleSignOut: () => Promise<void>;
}
