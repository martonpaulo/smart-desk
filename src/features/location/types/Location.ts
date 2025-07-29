import { BaseType } from '@/core/types/BaseType';

export interface Location extends BaseType {
  type: 'city' | 'flight' | 'bus' | 'stay' | 'hidden';
  name: string;
  startDate: Date;
  endDate: Date;
}
