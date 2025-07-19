'use client';

import { useState } from 'react';

import { Divider, Stack, Typography } from '@mui/material';

import { PageContentLayout } from '@/components/PageContentLayout';
import { TaskCard } from '@/components/TaskCard';
import { useDraftTasks } from '@/hooks/useDraftTasks';
import { useResponsiveness } from '@/hooks/useResponsiveness';
import { colorMap } from '@/styles/colors';
import { AddTaskFloatButton } from '@/widgets/TodoList/AddTaskFloatButton';
import { AddTaskInput } from '@/widgets/TodoList/AddTaskInput';

export default function DraftsPage() {
  const { isMobile } = useResponsiveness();
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const { draftCol, sortedDrafts, completedDrafts, trashedDrafts } = useDraftTasks();

  // handle missing config
  if (!draftCol) {
    return (
      <PageContentLayout title="Drafts" description="Drafts column not found">
        <Typography color="error">Could not find the drafts column in your board setup</Typography>
      </PageContentLayout>
    );
  }

  const cardWidth = isMobile ? '100%' : '250px';

  const draftCount = sortedDrafts.length;
  const completedCount = completedDrafts.length;
  const trashedCount = trashedDrafts.length;

  const pageTitle = 'Drafts';
  const pageDescription = `You have ${draftCount} draft${draftCount !== 1 ? 's' : ''}`;

  const completedTitle = 'Completed Tasks';
  const completedSubtitle = `You have completed ${completedCount} task${completedCount !== 1 ? 's' : ''}!`;

  const trashedTitle = 'Tasks in Trash';
  const trashedSubtitle = `There are ${trashedCount} task${trashedCount !== 1 ? 's' : ''} in the trash`;

  return (
    <PageContentLayout title={pageTitle} description={pageDescription}>
      <Stack direction="row" gap={1} flexWrap="wrap">
        {sortedDrafts.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            color={colorMap.red.value}
            width={cardWidth}
            editTask={editingTaskId === task.id}
            onFinishEditing={() => setEditingTaskId(null)}
          />
        ))}

        {!isMobile && (
          <AddTaskInput
            columnId={draftCol.id}
            columnColor={colorMap.pink.value}
            variant="outlined"
            sx={{ width: cardWidth }}
            onFinishAdding={newId => setEditingTaskId(newId)}
          />
        )}
      </Stack>

      <Divider flexItem sx={{ mt: 28, mb: 2 }} />

      <Stack spacing={1} mb={4}>
        <Typography variant="h6">{completedTitle}</Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {completedSubtitle}
        </Typography>
        <Stack direction="row" gap={1} flexWrap="wrap" pt={2}>
          {completedDrafts.map(task => (
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
          {trashedDrafts.map(task => (
            <TaskCard key={task.id} task={task} color={colorMap.grey.value} width={cardWidth} />
          ))}
        </Stack>
      </Stack>

      {isMobile && <AddTaskFloatButton />}
    </PageContentLayout>
  );
}
