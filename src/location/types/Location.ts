export interface Location {
  id: string;
  type: 'city' | 'flight' | 'bus' | 'stay' | 'hidden';
  name: string;
  startDate: Date;
  endDate: Date;
  updatedAt: Date;
  createdAt: Date;
  isSynced?: boolean;
}
