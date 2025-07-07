import { ReactElement } from 'react';

import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
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
import type { BoardState, Column, TodoTask } from '@/widgets/TodoList/types';

/**
 * Hook encapsulating trash state and restore logic
 */
function useTodoTrash() {
  // board state and setter from our Zustand store
  const board: BoardState = useTodoBoardStore(state => state.board);
  const setBoard = useTodoBoardStore(state => state.setBoard);

  // safely unwrap trash sections or default to empty arrays
  const trashedColumns: Column[] = board.trash?.columns ?? [];
  const trashedTasks: TodoTask[] = board.trash?.tasks ?? [];

  /**
   * Restore a single task by id
   */
  function restoreTask(taskId: string): void {
    setBoard((prev: BoardState) => {
      // find the task in trash
      const taskToRestore = prev.trash?.tasks.find(t => t.id === taskId);
      if (!taskToRestore) {
        // nothing to restore
        return prev;
      }

      // remove restored task from trash
      const updatedTrashTasks = prev.trash!.tasks.filter(t => t.id !== taskId);

      return {
        ...prev,
        tasks: [...prev.tasks, taskToRestore],
        trash: {
          ...prev.trash!,
          tasks: updatedTrashTasks,
        },
      };
    });
  }

  /**
   * Restore a column and all its tasks
   */
  function restoreColumn(columnId: string): void {
    setBoard((prev: BoardState) => {
      // find the column in trash
      const columnToRestore = prev.trash?.columns.find(c => c.id === columnId);
      if (!columnToRestore) {
        return prev;
      }

      // pick up tasks that belonged to this column
      const tasksInColumn: TodoTask[] = prev.trash!.tasks.filter(t => t.columnId === columnId);
      // filter out restored column and its tasks from trash
      const updatedTrashColumns: Column[] = prev.trash!.columns.filter(c => c.id !== columnId);
      const updatedTrashTasks: TodoTask[] = prev.trash!.tasks.filter(t => t.columnId !== columnId);

      return {
        ...prev,
        columns: [...prev.columns, columnToRestore],
        tasks: [...prev.tasks, ...tasksInColumn],
        trash: {
          columns: updatedTrashColumns,
          tasks: updatedTrashTasks,
        },
      };
    });
  }

  const isTrashEmpty: boolean = trashedColumns.length === 0 && trashedTasks.length === 0;

  return {
    trashedColumns,
    trashedTasks,
    isTrashEmpty,
    restoreTask,
    restoreColumn,
  };
}

/**
 * UI component to display trashed columns & tasks
 */
export function TodoTrash(): ReactElement {
  const { trashedColumns, trashedTasks, isTrashEmpty, restoreTask, restoreColumn } = useTodoTrash();

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Trash
      </Typography>

      <List dense>
        {trashedColumns.map((col: Column) => (
          <ListItem key={col.id} sx={{ pl: 0 }}>
            <ListItemText primary={`Column: ${col.title}`} />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                aria-label={`restore column ${col.title}`}
                onClick={() => restoreColumn(col.id)}
              >
                <RestoreFromTrashIcon fontSize="small" />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}

        {trashedTasks.map((task: TodoTask) => (
          <ListItem key={task.id} sx={{ pl: 0 }}>
            <ListItemText primary={`Task: ${task.title}`} />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                aria-label={`restore task ${task.title}`}
                onClick={() => restoreTask(task.id)}
              >
                <RestoreFromTrashIcon fontSize="small" />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}

        {isTrashEmpty && (
          <ListItem sx={{ pl: 0 }}>
            <ListItemText primary="Trash is empty" />
          </ListItem>
        )}
      </List>
    </Box>
  );
}
