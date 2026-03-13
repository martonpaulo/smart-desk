import { PowerSyncDatabase } from '@powersync/web';

import { appSchema } from '@/db/schema';

export const db = new PowerSyncDatabase({
  schema: appSchema,
  database: {
    dbFilename: 'smart-desk.db',
  },
  // Point to pre-built worker assets served from public/powersync/.
  // Next.js does not auto-bundle WASM workers from node_modules,
  // so assets are copied to public/ and referenced by URL.
  sync: {
    worker: '/powersync/worker/SharedSyncImplementation.umd.js',
  },
});
