import { Base } from '@/core/types/Base';

export type LocationType = 'city' | 'flight' | 'bus' | 'stay' | 'hidden';

export interface Location extends Base {
  type: LocationType;
  name: string;
  startDate: Date;
  endDate: Date;
}
