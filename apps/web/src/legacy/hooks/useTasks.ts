import { useCallback, useMemo } from 'react';

import { endOfDay, isAfter, isBefore, isSameDay, isToday, startOfDay } from 'date-fns';
import { TaskFilters } from 'src/features/task/types/TaskFilters';
import { useBoardStore } from 'src/legacy/store/board/store';
import type { Task } from 'src/legacy/types/task';
import { sortActive } from 'src/legacy/utils/taskUtils';

function matchesPlannedWindow(
  task: Task,
  opts: {
    plannedFrom?: Date | null;
    plannedTo?: Date | null;
    plannedDate?: Date | null;
    plannedMode?: 'include' | 'exclude' | 'only' | null | undefined;
  },
): boolean {
  const { plannedFrom, plannedTo, plannedDate, plannedMode } = opts;

  const onDate = plannedDate ?? null;
  const hasRange = !!plannedFrom || !!plannedTo;

  const taskHasPlanned = !!task.plannedDate;

  // Handle "only" tasks without plannedDate quickly
  if (plannedMode === 'only') return !taskHasPlanned;

  // If an exact "on" date is provided, match by same calendar day
  if (onDate) {
    if (!taskHasPlanned) {
      // If exact day filter is used and task has no date:
      // include only when explicitly requested
      return plannedMode === 'include';
    }
    return isSameDay(task.plannedDate as Date, onDate);
  }

  // If a range is provided, evaluate inclusively on calendar days
  if (hasRange) {
    if (!taskHasPlanned) {
      // In range mode, default to including no-date tasks unless explicitly excluded
      return plannedMode !== 'exclude';
    }

    const d = task.plannedDate as Date;
    const lower = plannedFrom ? startOfDay(plannedFrom) : null;
    const upper = plannedTo ? endOfDay(plannedTo) : null;

    // Inclusive comparisons at day granularity
    if (lower && isBefore(d, lower) && !isSameDay(d, lower)) return false;
    if (upper && isAfter(d, upper) && !isSameDay(d, upper)) return false;
    return true;
  }

  // No date filters at all: include everything unless explicitly excluding no-date tasks
  if (!taskHasPlanned) return plannedMode !== 'exclude';
  return true;
}

export function useTasks(filters: TaskFilters = {}) {
  const {
    title = null,
    important = null,
    urgent = null,
    blocked = null,

    plannedDate = null,

    plannedFrom = null,
    plannedTo = null,
    plannedMode = null,

    classified = null,
    estimated = null,

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

      const matchesPlanned = matchesPlannedWindow(task, {
        plannedFrom,
        plannedTo,
        plannedDate,
        plannedMode,
      });

      const isDone = task.quantityDone >= task.quantityTarget;
      const matchesDone = done == null ? true : isDone === done;

      const matchesDaily = daily == null ? true : task.daily === daily;

      const isTodaySafe = (date?: Date | null) => date != null && isToday(date);

      const matchesClassified =
        classified == null
          ? true
          : classified
            ? isTodaySafe(task.classifiedDate)
            : !isTodaySafe(task.classifiedDate);

      const matchesTrashed = trashed == null ? true : task.trashed === trashed;
      const matchesTag = tagId ? task.tagId === tagId : true;

      const matchesEstimated = estimated == null ? true : !!task.estimatedTime;

      return (
        matchesTitle &&
        matchesImportant &&
        matchesUrgent &&
        matchesBlocked &&
        matchesPlanned &&
        matchesDone &&
        matchesClassified &&
        matchesEstimated &&
        matchesDaily &&
        matchesTrashed &&
        matchesTag
      );
    },
    [
      title,
      important,
      urgent,
      blocked,
      plannedFrom,
      plannedTo,
      plannedDate,
      plannedMode,
      done,
      daily,
      classified,
      estimated,
      trashed,
      tagId,
    ],
  );

  const tasks = useMemo(() => {
    return allTasks.filter(matchesFilters).sort(sortActive);
  }, [allTasks, matchesFilters]);

  return tasks;
}
