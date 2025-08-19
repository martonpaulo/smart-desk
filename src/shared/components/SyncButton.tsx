import { useContext, useState } from 'react';

import { Button } from '@mui/material';

import { SupabaseSyncContext } from '@/core/providers/SupabaseSyncProvider';

export default function SyncButton() {
  const { syncNowForActiveFeatures } = useContext(SupabaseSyncContext);
  const [syncing, setSyncing] = useState(false);

  const handleSync = () => {
    if (syncing) return;
    setSyncing(true);
    void syncNowForActiveFeatures().finally(() => setSyncing(false));
  };

  return (
    <Button variant="outlined" onClick={handleSync} disabled={syncing}>
      {syncing ? 'Syncing...' : 'Sync now'}
    </Button>
  );
}
