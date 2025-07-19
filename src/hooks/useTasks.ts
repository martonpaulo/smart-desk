import { useEffect, useMemo, useState } from 'react';

import { useDefaultColumns } from '@/hooks/useDefaultColumns';
import { useBoardStore } from '@/store/board/store';
import type { Column } from '@/types/column';

export function useTasks(filterTitle = '') {
  const tasks = useBoardStore(state => state.tasks);

  // defaultColumns returns a Promise<Column|undefined>
  const doneColPromise = useDefaultColumns('done');
  const [doneColumn, setDoneColumn] = useState<Column | null>(null);

  // resolve the promise once
  useEffect(() => {
    let mounted = true;
    doneColPromise
      .then(col => {
        if (mounted && col) setDoneColumn(col);
      })
      .catch(() => {
        // optionally handle errors
        if (mounted) setDoneColumn(null);
      });
    return () => {
      mounted = false;
    };
  }, [doneColPromise]);

  // all but done & trashed sorted by urgent→important→oldest update
  const allTasks = useMemo(() => {
    if (!doneColumn) return [];
    return tasks
      .filter(
        t =>
          !t.trashed &&
          t.columnId !== doneColumn.id &&
          t.title.toLowerCase().includes(filterTitle.toLowerCase()),
      )
      .sort((a, b) => {
        if (a.urgent !== b.urgent) return a.urgent ? -1 : 1;
        if (a.important !== b.important) return a.important ? -1 : 1;
        return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      });
  }, [doneColumn, tasks, filterTitle]);

  // done column tasks newest first
  const doneTasks = useMemo(() => {
    if (!doneColumn) return [];
    return tasks
      .filter(
        t =>
          !t.trashed &&
          t.columnId === doneColumn.id &&
          t.title.toLowerCase().includes(filterTitle.toLowerCase()),
      )
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [doneColumn, tasks, filterTitle]);

  // trashed newest first
  const trashedTasks = useMemo(() => {
    return tasks
      .filter(t => t.trashed && t.title.toLowerCase().includes(filterTitle.toLowerCase()))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [tasks, filterTitle]);

  return {
    allTasks,
    doneTasks,
    trashedTasks,
  };
}
