'use client';

import { useState } from 'react';

import { Stack } from '@mui/material';

import { PageSection } from '@/core/components/PageSection';
import { defaultColumns } from '@/features/column/config/defaultColumns';
import { AddTaskInput } from '@/legacy/components/task/AddTaskInput';
import { TaskCard } from '@/legacy/components/task/TaskCard';
import { useTasks } from '@/legacy/hooks/useTasks';

export default function QuickList() {
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const tasks = useTasks({ plannedDate: new Date(), trashed: false, done: false });

  return (
    <PageSection title="Quick List" hideDescription>
      <AddTaskInput
        variant="outlined"
        taskProperties={{ plannedDate: new Date() }}
        onFinishAdding={newId => setEditingTaskId(newId)}
      />

      <Stack gap={1.5}>
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            showDaily={false}
            showDate={false}
            showDuration={true}
            showTag={false}
            durationPosition="right"
            color={defaultColumns.todo.color}
            editTask={editingTaskId === task.id}
            onFinishEditing={() => setEditingTaskId(null)}
          />
        ))}
      </Stack>
    </PageSection>
  );
}
