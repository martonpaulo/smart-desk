'use client';

import { PageContentLayout } from '@/components/PageContentLayout';
import { TaskCard } from '@/components/TaskCard';
import { useResponsiveness } from '@/hooks/useResponsiveness';
import { useBoardStore } from '@/store/board/store';
import { colorMap } from '@/styles/colors';
import { AddTaskFloatButton } from '@/widgets/TodoList/AddTaskFloatButton';

export default function DraftsPage() {
  const tasks = useBoardStore(state => state.tasks);
  const columns = useBoardStore(state => state.columns);
  const { isMobile } = useResponsiveness();

  const draftColumn = columns.find(c => c.title === 'Draft' && !c.trashed);
  const filtered = tasks.filter(t => !t.trashed && t.columnId === draftColumn?.id);

  const title = 'Drafts';
  const subtitle = `You have ${filtered.length} draft${filtered.length !== 1 ? 's' : ''}`;

  return (
    <PageContentLayout title={title} subtitle={subtitle}>
      {filtered.map(task => (
        <TaskCard key={task.id} task={task} color={colorMap.red.value} />
      ))}

      {isMobile && <AddTaskFloatButton />}
    </PageContentLayout>
  );
}
