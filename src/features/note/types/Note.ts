import { Base } from '@/core/types/Base';

export interface Note extends Base {
  title: string;
  content: string;
  color?: string;
}
