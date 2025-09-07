import RestoreIcon from '@mui/icons-material/RestoreFromTrash';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { Column } from 'src/legacy/types/column';
import { Task } from 'src/legacy/types/task';

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
            <ListItem
              key={col.id}
              sx={{ pl: 0 }}
              secondaryAction={
                <IconButton edge="end" onClick={() => col.id && onRestoreColumn(col.id)}>
                  <RestoreIcon fontSize="small" />
                </IconButton>
              }
            >
              <ListItemText primary={`Column: ${col.title}`} />
            </ListItem>
          ))}
          {tasks.map(task => (
            <ListItem
              key={task.id}
              sx={{ pl: 0 }}
              secondaryAction={
                <IconButton edge="end" onClick={() => onRestoreTask(task.id)}>
                  <RestoreIcon fontSize="small" />
                </IconButton>
              }
            >
              <ListItemText primary={`Task: ${task.title}`} />
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
