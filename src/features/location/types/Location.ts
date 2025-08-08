import { BaseType } from '@/core/types/BaseType';

export type LocationType = 'city' | 'flight' | 'bus' | 'stay' | 'hidden';

export interface Location extends BaseType {
  type: LocationType;
  name: string;
  startDate: Date;
  endDate: Date;
}
