import { BaseType } from '@/core/types/BaseType';

export interface Tag extends BaseType {
  name: string;
  color: string;
  position: number;
}
