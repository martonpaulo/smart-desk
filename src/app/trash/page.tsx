'use client';

import RestoreIcon from '@mui/icons-material/RestoreFromTrash';
import {
  Box,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import { useResponsiveness } from '@/hooks/useResponsiveness';
import { useBoardStore } from '@/store/board/store';
import { TodoTaskCard } from '@/widgets/TodoList/TodoTaskCard';

export default function TrashPage() {
  const tasks = useBoardStore(state => state.tasks);
  const updateTask = useBoardStore(state => state.updateTask);
  const columns = useBoardStore(state => state.columns);
  const { isMobile } = useResponsiveness();

  const trashed = tasks.filter(t => t.trashed);

  const handleRestore = async (id: string) => {
    await updateTask({ id, trashed: false, updatedAt: new Date() });
  };

  if (isMobile) {
    return (
      <Stack spacing={1} p={1}>
        {trashed.map(task => {
          const column = columns.find(c => c.id === task.columnId) ?? columns[0];
          return (
            <Box key={task.id} position="relative">
              <TodoTaskCard
                task={task}
                column={column}
                onOpen={() => {}}
                onRename={() => {}}
                onToggleDone={() => {}}
                onDragStart={() => {}}
                onDragOver={() => {}}
              />
              <IconButton
                aria-label="restore"
                onClick={() => handleRestore(task.id)}
                sx={{ position: 'absolute', top: 4, right: 4 }}
              >
                <RestoreIcon fontSize="small" />
              </IconButton>
            </Box>
          );
        })}
        {trashed.length === 0 && <Typography>Trash is empty</Typography>}
      </Stack>
    );
  }

  return (
    <Box p={2}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Column</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {trashed.map(task => {
            const column = columns.find(c => c.id === task.columnId);
            return (
              <TableRow key={task.id} hover>
                <TableCell>{task.title}</TableCell>
                <TableCell>{column?.title ?? '—'}</TableCell>
                <TableCell align="right">
                  <IconButton aria-label="restore" onClick={() => handleRestore(task.id)}>
                    <RestoreIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {trashed.length === 0 && <Typography>Trash is empty</Typography>}
    </Box>
  );
}
