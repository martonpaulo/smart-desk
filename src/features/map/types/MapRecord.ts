import { BaseType } from '@/core/types/BaseType';

export interface MapMetadata {
  // hex color per region key
  regionColors: Record<string, string>;
  // display label per region key
  regionLabels: Record<string, string>;
  // tooltip text per region key
  regionTooltips: Record<string, string>;
}

export interface MapRecord extends BaseType, MapMetadata {
  name: string;
  filePublicId: string; // Cloudinary public ID
  fileUrl: string; // secure_url from Cloudinary
}
