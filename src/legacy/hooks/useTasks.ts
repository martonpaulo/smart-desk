import { useCallback, useEffect, useMemo, useState } from 'react';

import { useDefaultColumns } from '@/legacy/hooks/useDefaultColumns';
import { useBoardStore } from '@/legacy/store/board/store';
import type { Column } from '@/legacy/types/column';
import type { Task } from '@/legacy/types/task';
import { sortActive, sortByUpdatedDesc } from '@/legacy/utils/taskUtils';
import { isSameDay } from '@/legacy/utils/timeUtils';

interface TaskFilters {
  title?: string;
  date?: Date;
}

export function useTasks(filters: TaskFilters = {}) {
  const { title = '', date } = filters;
  const allTasks = useBoardStore(s => s.tasks);

  // fetch done‑column info once
  const doneColumnPromise = useDefaultColumns('done');
  const [doneColumn, setDoneColumn] = useState<Column | null>(null);

  useEffect(() => {
    let mounted = true;
    doneColumnPromise
      .then(col => {
        if (mounted) setDoneColumn(col ?? null);
      })
      .catch(() => {
        if (mounted) setDoneColumn(null);
      });
    return () => {
      mounted = false;
    };
  }, [doneColumnPromise]);

  // common filter by title & optional date
  const matchesFilters = useCallback(
    (task: Task): boolean => {
      const matchesTitle = task.title.toLowerCase().includes(title.toLowerCase());
      const matchesDate = !date ? true : isSameDay(task.plannedDate, date);
      return matchesTitle && matchesDate;
    },
    [title, date],
  );

  // tasks not done, not trashed, sorted by priority & date
  const activeTasks = useMemo(() => {
    if (!doneColumn) return [];

    return allTasks.filter(t => t.trashed === false && matchesFilters(t)).sort(sortActive);
  }, [doneColumn, allTasks, matchesFilters]);

  const undoneActiveTasks = useMemo(() => {
    if (!doneColumn) return [];

    return allTasks
      .filter(t => t.trashed === false && t.columnId !== doneColumn.id && matchesFilters(t))
      .sort(sortActive);
  }, [doneColumn, allTasks, matchesFilters]);

  const noDateTasks = useMemo(() => {
    return activeTasks.filter((t: Task) => !t.plannedDate);
  }, [activeTasks]);

  // tasks in done column, newest first
  const doneTasks = useMemo(() => {
    // prevents errors if done column is not yet loaded
    if (!doneColumn) return [];

    return allTasks
      .filter(t => t.trashed === false && t.columnId === doneColumn.id && matchesFilters(t))
      .sort(sortByUpdatedDesc);
  }, [doneColumn, allTasks, matchesFilters]);

  // trashed tasks, newest first
  const trashedTasks = useMemo(() => {
    return allTasks.filter(t => t.trashed === true && matchesFilters(t)).sort(sortByUpdatedDesc);
  }, [allTasks, matchesFilters]);

  return { allTasks, activeTasks, undoneActiveTasks, doneTasks, trashedTasks, noDateTasks };
}
