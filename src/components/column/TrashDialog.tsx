import RestoreIcon from '@mui/icons-material/RestoreFromTrash';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
} from '@mui/material';

import { Column } from '@/types/column';
import { Task } from '@/types/task';

interface TrashDialogProps {
  open: boolean;
  tasks: Task[];
  columns: Column[];
  onRestoreTask: (id: string) => void;
  onRestoreColumn: (id: string) => void;
  onClose: () => void;
}

export function TrashDialog({
  open,
  tasks,
  columns,
  onRestoreTask,
  onRestoreColumn,
  onClose,
}: TrashDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Trash</DialogTitle>
      <DialogContent>
        <List dense>
          {columns.map(col => (
            <ListItem key={col.id} sx={{ pl: 0 }}>
              <ListItemText primary={`Column: ${col.title}`} />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="restore"
                  onClick={() => col.id && onRestoreColumn(col.id)}
                >
                  <RestoreIcon fontSize="small" />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
          {tasks.map(task => (
            <ListItem key={task.id} sx={{ pl: 0 }}>
              <ListItemText primary={`Task: ${task.title}`} />
              <ListItemSecondaryAction>
                <IconButton edge="end" aria-label="restore" onClick={() => onRestoreTask(task.id)}>
                  <RestoreIcon fontSize="small" />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
          {columns.length === 0 && tasks.length === 0 && (
            <ListItem sx={{ pl: 0 }}>
              <ListItemText primary="Trash is empty" />
            </ListItem>
          )}
        </List>
      </DialogContent>
    </Dialog>
  );
}
