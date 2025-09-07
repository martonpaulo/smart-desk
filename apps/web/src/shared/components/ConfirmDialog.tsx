import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { parseSafeHtml } from 'src/legacy/utils/textUtils';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  content?: string;
  onCancel: () => void;
  onConfirm: () => void;
  cancelButtonText?: string;
  confirmButtonText?: string;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  content = '',
  onCancel,
  onConfirm,
  cancelButtonText = 'Cancel',
  confirmButtonText = 'Confirm',
  loading = false,
}: ConfirmDialogProps) {
  const safeHtml = parseSafeHtml(content);

  return (
    <Dialog open={open} onClose={loading ? undefined : onCancel}>
      <DialogTitle>{title}</DialogTitle>
      {content && (
        <DialogContent>
          <DialogContentText>{safeHtml}</DialogContentText>
        </DialogContent>
      )}
      <DialogActions sx={{ justifyContent: 'flex-end', gap: 1, p: 2 }}>
        <Button onClick={onCancel} disabled={loading}>
          {cancelButtonText}
        </Button>
        <Button variant="contained" onClick={onConfirm} autoFocus disabled={loading}>
          {loading ? 'Loading...' : confirmButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
