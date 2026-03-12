import { PowerSyncDatabase } from '@powersync/web';

import { appSchema } from '@/db/schema';

export const db = new PowerSyncDatabase({
  schema: appSchema,
  database: {
    dbFilename: 'smart-desk.db',
  },
});
