import { Base } from 'src/core/types/Base';

export interface Note extends Base {
  title: string;
  content: string;
  color?: string;
}
