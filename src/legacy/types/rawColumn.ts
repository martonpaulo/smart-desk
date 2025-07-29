import { RawBaseType } from '@/core/types/RawBaseType';

export interface RawColumn extends RawBaseType {
  title: string;
  color: string;
  position: number;
}
