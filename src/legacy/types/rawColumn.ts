import { RawBase } from '@/core/types/Base';

export interface RawColumn extends RawBase {
  title: string;
  color: string;
  position: number;
}
