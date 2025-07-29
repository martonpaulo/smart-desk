import { useState } from 'react';

import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton, Tooltip } from '@mui/material';
import { useSnackbar } from 'notistack';

import { playInterfaceSound } from '@/features/sound/utils/soundPlayer';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';

interface ModalDeleteButtonProps {
  onDelete: () => Promise<void>;
  onClose: () => void;
}

export function ModalDeleteButton({ onDelete, onClose }: ModalDeleteButtonProps) {
  const { enqueueSnackbar } = useSnackbar();
  const [isTrashConfirmOpen, setTrashConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onDelete();
      enqueueSnackbar('Item deleted successfully', { variant: 'success' });
      playInterfaceSound('trash');
    } catch (error) {
      playInterfaceSound('error');
      console.error('Error deleting item:', error);
      enqueueSnackbar('Error deleting item', { variant: 'error' });
    } finally {
      setLoading(false);
      setTrashConfirmOpen(false);
      onClose();
    }
  };

  return (
    <>
      <Tooltip title="Delete">
        <IconButton onClick={() => setTrashConfirmOpen(true)}>
          <DeleteIcon />
        </IconButton>
      </Tooltip>

      <ConfirmDialog
        open={isTrashConfirmOpen}
        title="Confirm Delete"
        content="Are you sure you want to send this item to the <strong>trash</strong>? You can restore it later."
        onCancel={() => setTrashConfirmOpen(false)}
        onConfirm={handleDelete}
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
        loading={loading}
      />
    </>
  );
}
