import { useMemo } from 'react';

import { useBoardStore } from '@/legacy/store/board/store';
import type { Task } from '@/legacy/types/task';

export function usePlannableTasks(): Task[] {
  const tasks = useBoardStore(s => s.tasks);
  return useMemo(
    () => tasks.filter(t => !t.trashed && t.quantityDone !== t.quantityTarget),
    [tasks],
  );
}
