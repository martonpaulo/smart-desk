import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import DeleteIcon from '@mui/icons-material/Delete';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material';
import { useSnackbar } from 'notistack';

import { playInterfaceSound } from '@/features/sound/utils/soundPlayer';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { getErrorMessage } from '@/shared/utils/getErrorMessage';

interface CustomDialogProps {
  item: string;
  open: boolean;
  mode: 'new' | 'edit';
  maxWidth?: DialogProps['maxWidth'];
  isDirty: boolean;
  isValid: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
  deleteAction?: (id: string) => Promise<void>;
  deleteId?: string;
  title: string;
  onTitleChange: (value: string) => void;
  titlePlaceholder?: string;
  titleLimit?: number;
  children: ReactNode;
}

export function CustomDialog({
  item,
  open,
  mode,
  maxWidth = 'mobileLg',
  isDirty,
  isValid,
  onClose,
  onSave,
  deleteAction,
  deleteId,
  title,
  onTitleChange,
  titlePlaceholder,
  titleLimit,
  children,
}: CustomDialogProps) {
  const { enqueueSnackbar } = useSnackbar();

  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const hasError = titleLimit ? title.length > titleLimit : false;
  const canSave = isDirty && isValid && !hasError && !confirmOpen;
  const canDelete = mode === 'edit' && deleteAction && deleteId;

  const titleRef = useRef<HTMLInputElement>(null);

  // focus title when dialog fully opens
  const handleTransitionEntered = () => {
    titleRef.current?.focus();
    const len = titleRef.current?.value.length ?? 0;
    titleRef.current?.setSelectionRange(len, len);
  };

  const handleSave = useCallback(async () => {
    if (!canSave) return;
    setLoadingSave(true);
    try {
      await onSave();
      onClose();
    } catch (error) {
      const msg = getErrorMessage(error, 'Error saving');
      console.error(msg);
      enqueueSnackbar(msg, { variant: 'error' });
      playInterfaceSound('error');
    } finally {
      setLoadingSave(false);
    }
  }, [canSave, onSave, onClose, enqueueSnackbar]);

  // build dialog title
  const capitalItem = item.charAt(0).toUpperCase() + item.slice(1);
  const dialogTitle = mode === 'edit' ? `Edit ${capitalItem}` : `New ${capitalItem}`;

  const handleDelete = useCallback(async () => {
    if (!canDelete) return;
    setLoadingDelete(true);
    try {
      await deleteAction(deleteId);
      enqueueSnackbar(`${capitalItem} deleted`, { variant: 'success' });
      playInterfaceSound('trash');
      onClose();
    } catch (error) {
      const msg = getErrorMessage(error, `Error deleting ${item}`);
      console.error(msg);
      enqueueSnackbar(msg, { variant: 'error' });
      playInterfaceSound('error');
    } finally {
      setLoadingDelete(false);
      setConfirmOpen(false);
    }
  }, [canDelete, capitalItem, deleteAction, deleteId, enqueueSnackbar, item, onClose]);

  // keyboard shortcuts for Esc and Ctrl+Enter
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'Enter' || e.key === 'NumpadEnter')) {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, handleSave, onClose]);

  const handleDialogClose: DialogProps['onClose'] = (_e, reason) => {
    if (reason === 'backdropClick') {
      if (canSave) handleSave();
      else onClose();
    }
    if (reason === 'escapeKeyDown') {
      onClose(); // always close on Esc
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleDialogClose}
        fullWidth
        maxWidth={maxWidth}
        slotProps={{ transition: { onEntered: handleTransitionEntered } }}
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            {dialogTitle}

            {mode === 'edit' && (
              <Tooltip title={`Delete ${capitalItem}`}>
                <IconButton onClick={() => setConfirmOpen(true)} disabled={!canDelete}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Stack paddingTop={1} spacing={2}>
            <TextField
              inputRef={titleRef}
              label="Title"
              placeholder={titlePlaceholder}
              value={title}
              onChange={e => onTitleChange(e.target.value)}
              error={hasError}
              helperText={hasError ? `Max ${titleLimit} characters` : ''}
              fullWidth
              required
            />

            {children}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={loadingSave || loadingDelete}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={!canSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        title={`Confirm Delete ${capitalItem}`}
        content={`Are you sure you want to send this ${item} to the trash? You can restore it later.`}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
        loading={loadingDelete}
      />
    </>
  );
}
