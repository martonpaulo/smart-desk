import UndoIcon from '@mui/icons-material/Undo';
import { Alert, IconButton, Snackbar } from '@mui/material';

import { useUndoStore } from '@/legacy/store/undoStore';

const AUTO_HIDE_DURATION = 4000;

export function UndoSnackbar() {
  const action = useUndoStore(state => state.action);
  const clear = useUndoStore(state => state.clear);

  const handleUndo = () => {
    if (action) {
      action.onUndo();
      clear();
    }
  };

  if (!action) return null;

  return (
    <Snackbar
      open={Boolean(action)}
      autoHideDuration={AUTO_HIDE_DURATION}
      onClose={clear}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        onClose={clear}
        severity="info"
        action={
          <IconButton color="inherit" size="small" onClick={handleUndo}>
            <UndoIcon fontSize="small" />
          </IconButton>
        }
      >
        {action.message}
      </Alert>
    </Snackbar>
  );
}
