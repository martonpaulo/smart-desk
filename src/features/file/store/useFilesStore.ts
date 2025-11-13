import { createSyncedEntityStore } from 'src/core/store/createSyncedEntityStore';
import { File } from 'src/features/file/types/File';

export const useFilesStore = createSyncedEntityStore<File>({
  table: 'files',
  requiredFields: ['url', 'publicId'],
  defaults: {
    resourceType: 'image',
  },
});
