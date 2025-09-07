import type { Column } from 'src/legacy/types/column';
import type { Task } from 'src/legacy/types/task';

export function getNewColumnPosition(columns: Column[], previousColumnPosition?: number): number {
  if (!columns.length) return 0;

  // Sort columns by position in ascending order
  const sorted = [...columns].sort((a, b) => a.position - b.position);

  // No previous column: insert at beginning
  if (previousColumnPosition === undefined) {
    return sorted[0].position / 2;
  }

  const currentIndex = sorted.findIndex(c => c.position === previousColumnPosition);

  // Not found or it's the last one: add after the last
  if (currentIndex === -1 || currentIndex === sorted.length - 1) {
    return sorted[sorted.length - 1].position + 1;
  }

  const nextColumn = sorted[currentIndex + 1];
  return (previousColumnPosition + nextColumn.position) / 2;
}

/**
 * Get the highest task position in a given column
 * @returns 0 if no tasks in column, else max position
 */
export function getLastTaskPositionInColumn(tasks: Task[], columnId: string): number {
  const columnTasks = tasks.filter(t => t.columnId === columnId);
  if (columnTasks.length === 0) return 0;
  return Math.max(...columnTasks.map(t => t.position));
}

// Helper: merge two lists by `updatedAt`, preferring latest item
export function mergeById<T extends { id: string; updatedAt: Date }>(
  localList: T[],
  remoteList: T[],
): T[] {
  const map = new Map<string, T>();
  remoteList.forEach(item => map.set(item.id, item));
  localList.forEach(item => {
    const existing = map.get(item.id);
    if (!existing || item.updatedAt > existing.updatedAt) {
      map.set(item.id, item);
    }
  });
  return Array.from(map.values());
}
