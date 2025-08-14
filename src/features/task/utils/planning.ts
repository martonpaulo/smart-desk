import type { Task } from '@/legacy/types/task';

/** Ensure task has a planned date. Prompt user if missing. */
export function ensurePlannedDate(task: Task): Date {
  if (task.plannedDate) return task.plannedDate;
  const today = new Date();
  const useToday = window.confirm('Plan this task for today?');
  if (useToday) return today;
  const input = window.prompt('Enter planned date (YYYY-MM-DD):', today.toISOString().slice(0, 10));
  return input ? new Date(input) : today;
}

/** Ensure task has a duration in minutes. Prompt with presets. */
export function ensureDuration(task: Task): number {
  if (task.estimatedTime) return task.estimatedTime;
  const presets = [20, 40, 60];
  const input = window.prompt(
    `Set duration in minutes (${presets.join(', ')}):`,
    String(presets[0]),
  );
  const minutes = Number(input);
  return Number.isFinite(minutes) && minutes > 0 ? minutes : presets[0];
}

/** Apply important/urgent classification to task. */
export function classifyTask(task: Task, values: { important: boolean; urgent: boolean }): Task {
  return { ...task, important: values.important, urgent: values.urgent };
}
