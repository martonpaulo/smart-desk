import DeleteIcon from '@mui/icons-material/Delete';
import {
  Button,
  CircularProgress,
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
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import { ConfirmDialog } from 'src/shared/components/ConfirmDialog';
import { usePromiseFeedback } from 'src/shared/context/PromiseFeedbackContext';
import { getErrorMessage } from 'src/shared/utils/getErrorMessage';

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
  restoreAction?: (id: string) => Promise<void>;
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
  restoreAction,
  deleteId,
  title,
  onTitleChange,
  titlePlaceholder,
  titleLimit,
  children,
}: CustomDialogProps) {
  const { runWithFeedback, isLoading } = usePromiseFeedback();

  const [confirmOpen, setConfirmOpen] = useState(false);

  const hasError = titleLimit ? title.length > titleLimit : false;
  const canSave = isDirty && isValid && !hasError && !confirmOpen;
  const canDelete = mode === 'edit' && Boolean(deleteAction && deleteId);

  const titleRef = useRef<HTMLInputElement>(null);

  // keys for loading state reuse and consistency
  const capitalItem = item.charAt(0).toUpperCase() + item.slice(1);
  const dialogTitle = mode === 'edit' ? `Edit ${capitalItem}` : `New ${capitalItem}`;
  const saveKey = `dialog-${item}-save`;
  const deleteKey = `dialog-${item}-delete-${deleteId ?? 'na'}`;

  // focus title when dialog fully opens
  const handleTransitionEntered = () => {
    titleRef.current?.focus();
    const len = titleRef.current?.value.length ?? 0;
    titleRef.current?.setSelectionRange(len, len);
  };

  // Save wrapped with PromiseFeedback
  const handleSave = useCallback(async () => {
    if (!canSave) return;

    await runWithFeedback<void>({
      key: saveKey,
      operation: async () => {
        await onSave();
        onClose();
      },
      successMessage: `${capitalItem} saved`,
      errorMessage: getErrorMessage(null, 'Error saving'),
    });
  }, [canSave, runWithFeedback, saveKey, onSave, onClose, capitalItem]);

  const handleDelete = useCallback(async () => {
    if (!canDelete || !deleteAction || !deleteId) return;

    await runWithFeedback<void>({
      key: deleteKey,
      operation: async () => {
        await deleteAction(deleteId);
        onClose();
      },
      successSound: 'trash',
      successMessage: `${capitalItem} deleted`,
      errorMessage: getErrorMessage(null, `Error deleting ${item}`),
      onUndo: restoreAction ? () => restoreAction(deleteId) : undefined,
    });

    setConfirmOpen(false);
  }, [
    canDelete,
    deleteAction,
    deleteId,
    runWithFeedback,
    deleteKey,
    capitalItem,
    item,
    onClose,
    restoreAction,
  ]);

  // keyboard shortcuts for Esc and Ctrl+Enter
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
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
    if (reason === 'escapeKeyDown') onClose();
  };

  // visual loading states derived from PromiseFeedback
  const saving = isLoading(saveKey);
  const deleting = isLoading(deleteKey);

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
                <span>
                  <IconButton
                    onClick={() => setConfirmOpen(true)}
                    disabled={!canDelete || deleting}
                  >
                    {deleting ? <CircularProgress size={18} /> : <DeleteIcon />}
                  </IconButton>
                </span>
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
          <Button onClick={onClose} disabled={saving || deleting}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!canSave || saving}
            startIcon={saving ? <CircularProgress color="inherit" size={16} /> : undefined}
          >
            {saving ? 'Saving…' : 'Save'}
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
        loading={deleting}
      />
    </>
  );
}
