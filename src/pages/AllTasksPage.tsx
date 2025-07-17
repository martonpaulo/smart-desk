'use client';

import { useState } from 'react';

import { Box, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';

import { useResponsiveness } from '@/hooks/useResponsiveness';
import { useBoardStore } from '@/store/board/store';
import { TodoTaskCard } from '@/widgets/TodoList/TodoTaskCard';

export function AllTasksPage() {
  const tasks = useBoardStore(state => state.tasks);
  const columns = useBoardStore(state => state.columns);
  const { isMobile } = useResponsiveness();
  const [search, setSearch] = useState('');

  const filtered = tasks.filter(task => {
    if (task.trashed) return false;
    return task.title.toLowerCase().includes(search.toLowerCase());
  });

  if (isMobile) {
    return (
      <Stack spacing={1} p={1}>
        <TextField
          label="Search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          variant="outlined"
        />
        {filtered.map(task => {
          const column = columns.find(c => c.id === task.columnId);
          if (!column) return null;
          return (
            <TodoTaskCard
              key={task.id}
              task={task}
              column={column}
              onOpen={() => {}}
              onRename={() => {}}
              onToggleDone={() => {}}
              onDragStart={() => {}}
              onDragOver={() => {}}
            />
          );
        })}
        {filtered.length === 0 && <Typography>No tasks found</Typography>}
      </Stack>
    );
  }

  return (
    <Box p={2}>
      <TextField
        label="Search"
        value={search}
        onChange={e => setSearch(e.target.value)}
        variant="outlined"
        sx={{ mb: 2 }}
      />
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Column</TableCell>
            <TableCell align="center">Important</TableCell>
            <TableCell align="center">Urgent</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.map(task => {
            const column = columns.find(c => c.id === task.columnId);
            return (
              <TableRow key={task.id} hover>
                <TableCell>{task.title}</TableCell>
                <TableCell>{column?.title ?? '—'}</TableCell>
                <TableCell align="center">{task.important ? '✓' : ''}</TableCell>
                <TableCell align="center">{task.urgent ? '✓' : ''}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {filtered.length === 0 && <Typography>No tasks found</Typography>}
    </Box>
  );
}
