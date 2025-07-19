'use client';

import { useState } from 'react';

import { Divider, Stack, TextField, Typography } from '@mui/material';

import { PageContentLayout } from '@/components/PageContentLayout';
import { TaskCard } from '@/components/TaskCard';
import { useResponsiveness } from '@/hooks/useResponsiveness';
import { useTasks } from '@/hooks/useTasks';
import { colorMap } from '@/styles/colors';
import { AddTaskFloatButton } from '@/widgets/TodoList/AddTaskFloatButton';
import { AddTaskInput } from '@/widgets/TodoList/AddTaskInput';

export default function AllTasksPage() {
  const { isMobile } = useResponsiveness();
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const { allTasks, doneTasks, trashedTasks } = useTasks(filter);

  const cardWidth = isMobile ? '100%' : '250px';

  const allTasksCount = allTasks.length;
  const doneTasksCount = doneTasks.length;
  const trashedCount = trashedTasks.length;

  const allTasksTitle = 'All Tasks';
  const allTasksSubtitle = `You have a total of ${allTasksCount} task${allTasksCount !== 1 ? 's' : ''}`;

  const doneTasksTitle = 'Completed Tasks';
  const doneTasksSubtitle = `You have completed ${doneTasksCount} task${doneTasksCount !== 1 ? 's' : ''}!`;

  const trashedTitle = 'Tasks in Trash';
  const trashedSubtitle = `There are ${trashedCount} task${trashedCount !== 1 ? 's' : ''} in the trash`;

  return (
    <PageContentLayout title={allTasksTitle} description={allTasksSubtitle}>
      <TextField
        placeholder="Filter Tasks by Title"
        value={filter}
        onChange={e => setFilter(e.target.value)}
        variant="outlined"
      />

      <Stack direction="row" gap={1} flexWrap="wrap">
        {allTasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            color={colorMap.orange.value}
            width={cardWidth}
            editTask={editingTaskId === task.id}
            onFinishEditing={() => setEditingTaskId(null)}
          />
        ))}

        {!isMobile && (
          <AddTaskInput
            variant="outlined"
            sx={{ width: cardWidth }}
            onFinishAdding={newId => setEditingTaskId(newId)}
          />
        )}
      </Stack>

      <Divider flexItem sx={{ mt: 14, mb: 2 }} />

      <Stack spacing={1} mb={4}>
        <Typography variant="h6">{doneTasksTitle}</Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {doneTasksSubtitle}
        </Typography>
        <Stack direction="row" gap={1} flexWrap="wrap" pt={2}>
          {doneTasks.map(task => (
            <TaskCard key={task.id} task={task} color={colorMap.green.value} width={cardWidth} />
          ))}
        </Stack>
      </Stack>

      <Stack spacing={1} mb={4}>
        <Typography variant="h6">{trashedTitle}</Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {trashedSubtitle}
        </Typography>
        <Stack direction="row" gap={1} flexWrap="wrap" pt={2}>
          {trashedTasks.map(task => (
            <TaskCard key={task.id} task={task} color={colorMap.grey.value} width={cardWidth} />
          ))}
        </Stack>
      </Stack>

      {isMobile && <AddTaskFloatButton />}
    </PageContentLayout>
  );
}
