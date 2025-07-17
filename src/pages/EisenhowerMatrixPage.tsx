'use client';

import { Grid, Paper, Stack, Typography } from '@mui/material';

import { useResponsiveness } from '@/hooks/useResponsiveness';
import { useBoardStore } from '@/store/board/store';
import { TodoTaskCard } from '@/widgets/TodoList/TodoTaskCard';

export function EisenhowerMatrixPage() {
  const tasks = useBoardStore(state => state.tasks);
  const columns = useBoardStore(state => state.columns);
  const { isMobile } = useResponsiveness();

  const active = tasks.filter(t => !t.trashed);
  const q1 = active.filter(t => t.important && t.urgent);
  const q2 = active.filter(t => t.important && !t.urgent);
  const q3 = active.filter(t => !t.important && t.urgent);
  const q4 = active.filter(t => !t.important && !t.urgent);

  const renderList = (list: typeof tasks) => (
    <Stack spacing={1}>
      {list.map(task => {
        const column = columns.find(c => c.id === task.columnId);
        if (!column) return null;
        if (isMobile) {
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
        }
        return <Typography key={task.id}>• {task.title}</Typography>;
      })}
      {list.length === 0 && <Typography>No tasks</Typography>}
    </Stack>
  );

  if (isMobile) {
    return (
      <Stack p={1} spacing={2}>
        <Typography variant="h3">Important & Urgent</Typography>
        {renderList(q1)}
        <Typography variant="h3">Important & Not Urgent</Typography>
        {renderList(q2)}
        <Typography variant="h3">Not Important & Urgent</Typography>
        {renderList(q3)}
        <Typography variant="h3">Not Important & Not Urgent</Typography>
        {renderList(q4)}
      </Stack>
    );
  }

  return (
    <Grid container spacing={2} p={2}>
      <Grid item xs={6}>
        <Paper sx={{ p: 1 }}>
          <Typography variant="h4" gutterBottom>
            Important & Urgent
          </Typography>
          {renderList(q1)}
        </Paper>
      </Grid>
      <Grid item xs={6}>
        <Paper sx={{ p: 1 }}>
          <Typography variant="h4" gutterBottom>
            Important & Not Urgent
          </Typography>
          {renderList(q2)}
        </Paper>
      </Grid>
      <Grid item xs={6}>
        <Paper sx={{ p: 1 }}>
          <Typography variant="h4" gutterBottom>
            Not Important & Urgent
          </Typography>
          {renderList(q3)}
        </Paper>
      </Grid>
      <Grid item xs={6}>
        <Paper sx={{ p: 1 }}>
          <Typography variant="h4" gutterBottom>
            Not Important & Not Urgent
          </Typography>
          {renderList(q4)}
        </Paper>
      </Grid>
    </Grid>
  );
}
