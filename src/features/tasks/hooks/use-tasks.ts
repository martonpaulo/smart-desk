import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getTasks } from '@/features/tasks/logic/get-tasks';
import {
  createTask,
  deleteTask,
  type TaskPayload,
  updateTask,
} from '@/features/tasks/logic/task-mutations';

const TASKS_REFRESH_INTERVAL_MS = 10_000;
const TASKS_QUERY_KEY = ['tasks'] as const;
const DAY_ITEMS_QUERY_KEY = ['calendar-items-day'] as const;
const MISSING_USER_ID_ERROR = 'Sign in to create, update, or delete tasks.';

interface UpdateTaskMutationPayload extends TaskPayload {
  id: string;
}

function invalidateTaskQueries(queryClient: ReturnType<typeof useQueryClient>): Promise<unknown[]> {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY }),
    queryClient.invalidateQueries({ queryKey: DAY_ITEMS_QUERY_KEY }),
  ]);
}

export function useTasks() {
  return useQuery({
    queryKey: TASKS_QUERY_KEY,
    queryFn: getTasks,
    refetchInterval: TASKS_REFRESH_INTERVAL_MS,
  });
}

export function useCreateTask(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: TaskPayload) => {
      if (!userId) {
        throw new Error(MISSING_USER_ID_ERROR);
      }

      await createTask({ ...payload, userId });
    },
    onSuccess: async () => {
      await invalidateTaskQueries(queryClient);
    },
  });
}

export function useUpdateTask(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateTaskMutationPayload) => {
      if (!userId) {
        throw new Error(MISSING_USER_ID_ERROR);
      }

      await updateTask({ ...payload, userId });
    },
    onSuccess: async () => {
      await invalidateTaskQueries(queryClient);
    },
  });
}

export function useDeleteTask(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      if (!userId) {
        throw new Error(MISSING_USER_ID_ERROR);
      }

      await deleteTask({ id: taskId, userId });
    },
    onSuccess: async () => {
      await invalidateTaskQueries(queryClient);
    },
  });
}
