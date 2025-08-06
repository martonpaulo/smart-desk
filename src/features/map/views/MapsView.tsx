'use client';

import { useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import { Button, Stack, Typography } from '@mui/material';

import { PageSection } from '@/core/components/PageSection';
import { useFilesStore } from '@/features/file/store/useFilesStore';
import { MapCard } from '@/features/map/components/MapCard';
import { MapCreateDialog } from '@/features/map/components/MapCreateDialog';
import { useMapsStore } from '@/features/map/store/useMapsStore';

export function MapsView() {
  const maps = useMapsStore(s => s.items);
  const files = useFilesStore(s => s.items);
  const [open, setOpen] = useState(false);

  return (
    <PageSection
      title="Maps"
      description="Upload, create, edit, and color interactive maps. Manage regions visually and customize each map your way."
    >
      <Stack direction="row" mb={2}>
        <Button startIcon={<AddIcon />} variant="outlined" onClick={() => setOpen(true)}>
          New Map
        </Button>
      </Stack>

      {maps.length === 0 && <Typography>No maps yet. Click “New Map” to create one.</Typography>}

      <Stack direction="row" flexWrap="wrap" gap={2}>
        {maps.map(m => {
          const file = files.find(f => f.publicId === m.filePublicId);
          return <MapCard key={m.id} map={m} file={file} />;
        })}
      </Stack>

      <MapCreateDialog open={open} onClose={() => setOpen(false)} />
    </PageSection>
  );
}
