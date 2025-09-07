'use client';

import AddIcon from '@mui/icons-material/Add';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { Button, Stack, Tooltip } from '@mui/material';
import { useResponsiveness } from 'src/shared/hooks/useResponsiveness';

type NotesToolbarProps = {
  onAdd: () => void;
};

export function NotesToolbar({ onAdd }: NotesToolbarProps) {
  const isMobile = useResponsiveness();

  // Keep it minimal on mobile. Desktop gets labeled button.
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
      <Tooltip title="Grid view">
        <ViewModuleIcon color="action" />
      </Tooltip>

      {!isMobile ? (
        <Button startIcon={<AddIcon />} variant="contained" onClick={onAdd}>
          Add note
        </Button>
      ) : (
        <Button startIcon={<AddIcon />} variant="outlined" size="small" onClick={onAdd}>
          Add
        </Button>
      )}
    </Stack>
  );
}
