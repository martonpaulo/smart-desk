import { createSyncedEntityStore } from '@/core/store/createSyncedEntityStore';
import { Tag } from '@/features/tag/types/Tag';

export const useTagsStore = createSyncedEntityStore<Tag>({
  table: 'tags',
  requiredFields: ['name', 'color', 'position'],
});
