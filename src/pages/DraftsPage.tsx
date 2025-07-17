'use client';

import { Box, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';

import { useResponsiveness } from '@/hooks/useResponsiveness';
import { useBoardStore } from '@/store/board/store';
import { TodoTaskCard } from '@/widgets/TodoList/TodoTaskCard';

export function DraftsPage() {
  const tasks = useBoardStore(state => state.tasks);
  const columns = useBoardStore(state => state.columns);
  const { isMobile } = useResponsiveness();

  const draftColumn = columns.find(c => c.title === 'Draft' && !c.trashed);
  const filtered = tasks.filter(t => !t.trashed && t.columnId === draftColumn?.id);

  if (isMobile) {
    return (
      <Stack spacing={1} p={1}>
        {filtered.map(task => (
          <TodoTaskCard
            key={task.id}
            task={task}
            column={draftColumn!}
            onOpen={() => {}}
            onRename={() => {}}
            onToggleDone={() => {}}
            onDragStart={() => {}}
            onDragOver={() => {}}
          />
        ))}
        {filtered.length === 0 && <Typography>No drafts</Typography>}
      </Stack>
    );
  }

  return (
    <Box p={2}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.map(task => (
            <TableRow key={task.id} hover>
              <TableCell>{task.title}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {filtered.length === 0 && <Typography>No drafts</Typography>}
    </Box>
  );
}
