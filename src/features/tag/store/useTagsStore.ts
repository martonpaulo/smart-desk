import { createSyncedEntityStore } from 'src/core/store/createSyncedEntityStore';
import { Tag } from 'src/features/tag/types/Tag';

export const useTagsStore = createSyncedEntityStore<Tag>({
  table: 'tags',
  requiredFields: ['name', 'color', 'position'],
});
