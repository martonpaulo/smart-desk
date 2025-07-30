import { useCallback, useMemo } from 'react';

import { isSameDay } from 'date-fns';

import { TaskFilters } from '@/features/task/types/TaskFilters';
import { useBoardStore } from '@/legacy/store/board/store';
import type { Task } from '@/legacy/types/task';
import { sortActive } from '@/legacy/utils/taskUtils';

export function useTasks(filters: TaskFilters = {}) {
  const {
    title = null,
    important = null,
    urgent = null,
    blocked = null,
    plannedDate = null,
    done = null,
    daily = null,
    trashed = null,
    tagId = undefined,
  } = filters;

  const allTasks = useBoardStore(s => s.tasks);

  const matchesFilters = useCallback(
    (task: Task): boolean => {
      const matchesTitle = !title ? true : task.title.toLowerCase().includes(title.toLowerCase());

      const matchesImportant = important == null ? true : task.important === important;

      const matchesUrgent = urgent == null ? true : task.urgent === urgent;

      const matchesBlocked = blocked == null ? true : task.blocked === blocked;

      const matchesPlannedDate = !plannedDate
        ? true
        : task.plannedDate
          ? isSameDay(task.plannedDate, plannedDate)
          : false;

      const isDone = task.quantityDone >= task.quantityTarget;
      const matchesDone = done == null ? true : isDone === done;

      const matchesDaily = daily == null ? true : task.daily === daily;

      const matchesTrashed = trashed == null ? true : task.trashed === trashed;
      const matchesTag = tagId ? task.tagId === tagId : true;

      return (
        matchesTitle &&
        matchesImportant &&
        matchesUrgent &&
        matchesBlocked &&
        matchesPlannedDate &&
        matchesDone &&
        matchesDaily &&
        matchesTrashed &&
        matchesTag
      );
    },
    [title, important, urgent, blocked, plannedDate, done, daily, trashed, tagId],
  );

  const tasks = useMemo(() => {
    return allTasks.filter(task => matchesFilters(task)).sort(sortActive);
  }, [allTasks, matchesFilters]);

  return tasks;
}
