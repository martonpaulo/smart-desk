import { PowerSyncDatabase, WASQLiteOpenFactory } from '@powersync/web';

import { appSchema } from '@/db/schema';

const databaseFactory = new WASQLiteOpenFactory({
  dbFilename: 'smart-desk.db',
  worker: '/@powersync/worker/WASQLiteDB.umd.js',
});

export const db = new PowerSyncDatabase({
  schema: appSchema,
  database: databaseFactory,
  flags: {
    disableSSRWarning: true,
  },
  // Point to pre-bundled workers copied into public/@powersync/ by powersync-web copy-assets.
  sync: {
    worker: '/@powersync/worker/SharedSyncImplementation.umd.js',
  },
});
