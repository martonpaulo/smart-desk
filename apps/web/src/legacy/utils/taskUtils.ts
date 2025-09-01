import { Task } from 'src/legacy/types/task';

export function isTaskEmpty(task: Task): boolean {
  const isTitleEmpty = task.title.trim() === '';
  const isNotesEmpty = !task.notes || task.notes.trim() === '';

  return isTitleEmpty && isNotesEmpty;
}

// pure sort: active tasks by blocked, urgent, important, then oldest planned/updated
export function sortActive(a: Task, b: Task): number {
  // Sort trashed tasks to the end
  if (a.trashed && !b.trashed) return 1;
  if (!a.trashed && b.trashed) return -1;

  if (a.blocked !== b.blocked) return a.blocked ? 1 : -1;

  // Sort done tasks to the end
  if (a.quantityDone >= a.quantityTarget && b.quantityDone < b.quantityTarget) return 1;
  if (a.quantityDone < a.quantityTarget && b.quantityDone >= b.quantityTarget) return -1;

  // Sort tasks without title to the end
  if (a.title.trim() === '' && b.title.trim() !== '') return 1;
  if (a.title.trim() !== '' && b.title.trim() === '') return -1;

  if (a.urgent !== b.urgent) return a.urgent ? -1 : 1;
  if (a.important !== b.important) return a.important ? -1 : 1;

  const aTime = a.plannedDate ? new Date(a.plannedDate).getTime() : NaN;
  const bTime = b.plannedDate ? new Date(b.plannedDate).getTime() : NaN;

  if (!isNaN(aTime) && !isNaN(bTime)) return aTime - bTime;
  if (!isNaN(aTime)) return -1; // a has date, b not
  if (!isNaN(bTime)) return 1; // b has date, a not

  return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
}

// pure sort: newest updated first
export function sortByUpdatedDesc(a: Task, b: Task): number {
  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
}
