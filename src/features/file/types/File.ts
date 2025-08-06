import { BaseType } from '@/core/types/BaseType';

export interface File extends BaseType {
  url: string;
  publicId: string;
  resourceType: 'image' | 'video' | 'raw';
}
