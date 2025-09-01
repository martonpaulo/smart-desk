import { Base } from 'src/core/types/Base';

export interface File extends Base {
  url: string;
  publicId: string;
  resourceType: 'image' | 'video' | 'raw';
}
