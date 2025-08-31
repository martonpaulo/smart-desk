import { createSyncedEntityStore } from '@/core/store/createSyncedEntityStore';
import { File } from '@/features/file/types/File';

export const useFilesStore = createSyncedEntityStore<File>({
  table: 'files',
  requiredFields: ['url', 'publicId'],
  defaults: {
    resourceType: 'image',
  },
});
