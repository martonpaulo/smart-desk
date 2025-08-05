import { createSyncedEntityStore } from '@/core/store/createSyncedEntityStore';
import type { CloudinaryImage } from '@/features/image/types/CloudinaryImage';

export const useCloudinaryImagesStore = createSyncedEntityStore<CloudinaryImage>({
  table: 'cloudinary_images',
  requiredFields: ['url', 'publicId'],
  defaults: {},
});
