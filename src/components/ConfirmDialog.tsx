import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import DOMPurify from 'dompurify';
import parse from 'html-react-parser';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  content: string;
  onCancel: () => void;
  onConfirm: () => void;
  cancelButtonText?: string;
  confirmButtonText?: string;
}

export function ConfirmDialog({
  open,
  title,
  content,
  onCancel,
  onConfirm,
  cancelButtonText = 'Cancel',
  confirmButtonText = 'Confirm',
}: ConfirmDialogProps) {
  const safeHtml = parse(DOMPurify.sanitize(content, { USE_PROFILES: { html: true } }));

  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{safeHtml}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'flex-end', gap: 1, p: 2 }}>
        <Button onClick={onCancel}>{cancelButtonText}</Button>
        <Button variant="contained" onClick={onConfirm} autoFocus>
          {confirmButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
