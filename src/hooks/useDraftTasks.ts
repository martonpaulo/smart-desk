import { useMemo } from 'react';

import { useBoardStore } from '@/store/board/store';
import { defaultColumns } from '@/widgets/TodoList/defaultColumns';

export function useDraftTasks() {
  const tasks = useBoardStore(state => state.tasks);
  const columns = useBoardStore(state => state.columns);

  // find our special columns
  const draftCol = columns.find(c => c.title === defaultColumns.draft.title);
  const doneCol = columns.find(c => c.title === defaultColumns.done.title);

  // only keep non‑trashed drafts
  const draftTasks = useMemo(() => {
    if (!draftCol) return [];
    return tasks.filter(t => !t.trashed && t.columnId === draftCol.id);
  }, [tasks, draftCol]);

  // sort by urgent → important → oldest update first
  const sortedDrafts = useMemo(() => {
    return [...draftTasks].sort((a, b) => {
      if (a.urgent !== b.urgent) return a.urgent ? -1 : 1;
      if (a.important !== b.important) return a.important ? -1 : 1;
      return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    });
  }, [draftTasks]);

  // completed drafts newest first
  const completedDrafts = useMemo(() => {
    if (!doneCol) return [];
    return tasks
      .filter(t => !t.trashed && t.columnId === doneCol.id)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [tasks, doneCol]);

  // trashed drafts in either draft or done col, newest first
  const trashedDrafts = useMemo(() => {
    if (!draftCol || !doneCol) return [];
    return tasks
      .filter(t => t.trashed && (t.columnId === draftCol.id || t.columnId === doneCol.id))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [tasks, draftCol, doneCol]);

  return {
    draftCol,
    sortedDrafts,
    completedDrafts,
    trashedDrafts,
  };
}
