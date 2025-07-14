import { IcsCalendar as BaseIcsCalendar } from '@/types/icsCalendar';

export interface SettingsState {
  icsCalendars: SyncIcsCalendar[];
  pendingIcsCalendars: SyncIcsCalendar[];

  addIcsCalendar(data: AddIcsCalendarData): Promise<string>;
  updateIcsCalendar(data: UpdateIcsCalendarData): Promise<void>;
  deleteIcsCalendar(data: DeleteIcsCalendarData): Promise<void>;

  syncPending(): Promise<void>;
  syncFromServer(): Promise<void>;
}

// Extend base types with a sync flag
export interface SyncIcsCalendar extends BaseIcsCalendar {
  isSynced: boolean;
}

export interface AddIcsCalendarData {
  title: string;
  color: string;
  source: string;
}

export interface UpdateIcsCalendarData {
  id: string;
  title?: string;
  color?: string;
  source?: string;
}

export interface DeleteIcsCalendarData {
  id: string;
}
