import RestoreIcon from '@mui/icons-material/RestoreFromTrash';
import {
  Box,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Typography,
} from '@mui/material';

import { useTodoBoardStore } from '@/store/todoBoardStore';

export function TodoTrash() {
  const board = useTodoBoardStore(state => state.board);
  const setBoard = useTodoBoardStore(state => state.setBoard);

  const handleRestoreTask = (id: string) => {
    setBoard(prev => {
      const task = prev.trash.tasks.find(t => t.id === id);
      if (!task) return prev;
      return {
        ...prev,
        tasks: [...prev.tasks, task],
        trash: { ...prev.trash, tasks: prev.trash.tasks.filter(t => t.id !== id) },
      };
    });
  };

  const handleRestoreColumn = (id: string) => {
    setBoard(prev => {
      const column = prev.trash.columns.find(c => c.id === id);
      if (!column) return prev;
      const tasks = prev.trash.tasks.filter(t => t.columnId === id);
      return {
        ...prev,
        columns: [...prev.columns, column],
        tasks: [...prev.tasks, ...tasks],
        trash: {
          columns: prev.trash.columns.filter(c => c.id !== id),
          tasks: prev.trash.tasks.filter(t => t.columnId !== id),
        },
      };
    });
  };

  const { tasks, columns } = board.trash;
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Trash
      </Typography>
      <List dense>
        {columns.map(col => (
          <ListItem key={col.id} sx={{ pl: 0 }}>
            <ListItemText primary={`Column: ${col.title}`} />
            <ListItemSecondaryAction>
              <IconButton edge="end" aria-label="restore" onClick={() => handleRestoreColumn(col.id)}>
                <RestoreIcon fontSize="small" />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
        {tasks.map(task => (
          <ListItem key={task.id} sx={{ pl: 0 }}>
            <ListItemText primary={`Task: ${task.title}`} />
            <ListItemSecondaryAction>
              <IconButton edge="end" aria-label="restore" onClick={() => handleRestoreTask(task.id)}>
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
    </Box>
  );
}
