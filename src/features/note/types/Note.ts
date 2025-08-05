import { BaseType } from '@/core/types/BaseType';

export interface Note extends BaseType {
  title: string;
  content: string;
  color?: string;
}
