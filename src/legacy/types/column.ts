import { BaseType } from '@/core/types/BaseType';

export interface Column extends BaseType {
  title: string;
  color: string;
  position: number;
}
