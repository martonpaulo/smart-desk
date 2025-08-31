import { IcsCalendar } from '@/legacy/types/icsCalendar';

export interface SettingsState {
  icsCalendars: IcsCalendar[];
  pendingIcsCalendars: IcsCalendar[];

  addIcsCalendar(data: AddIcsCalendarData): Promise<string>;
  updateIcsCalendar(data: UpdateIcsCalendarData): Promise<void>;
  deleteIcsCalendar(data: DeleteIcsCalendarData): Promise<void>;

  syncPending(): Promise<void>;
  syncFromServer(): Promise<void>;
}

export interface AddIcsCalendarData {
  title: string;
  color: string;
  source: string;
  updatedAt: Date;
}

export interface UpdateIcsCalendarData {
  id: string;
  title?: string;
  color?: string;
  source?: string;
  updatedAt: Date;
}

export interface DeleteIcsCalendarData {
  id: string;
}
