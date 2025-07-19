'use client';

import { useState } from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

import { PageContentLayout } from '@/components/PageContentLayout';
import { TaskCard } from '@/components/TaskCard';
import { useResponsiveness } from '@/hooks/useResponsiveness';
import { useBoardStore } from '@/store/board/store';

export default function AllTasksPage() {
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
      <PageContentLayout title="All Tasks" description="Manage your tasks">
        <TextField
          label="Search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          variant="outlined"
        />
        {filtered.map(task => {
          const column = columns.find(c => c.id === task.columnId);
          if (!column) return null;
          return <TaskCard key={task.id} task={task} color={column.color} />;
        })}
        {filtered.length === 0 && <Typography>No tasks found</Typography>}
      </PageContentLayout>
    );
  }

  return (
    <PageContentLayout title="All Tasks" description="Manage your tasks">
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
    </PageContentLayout>
  );
}
