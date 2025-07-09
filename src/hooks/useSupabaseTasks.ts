import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSupabaseClient } from '@/lib/supabaseClient';
import {
  createTask,
  deleteTask,
  fetchTasks,
  updateTask,
  type NewTask,
} from '@/services/supabaseTasksService';
import type { TodoTask } from '@/widgets/TodoList/types';

export function useTasks() {
  const supabase = useSupabaseClient();
  return useQuery({
    queryKey: ['tasks'],
    queryFn: () => fetchTasks(supabase),
  });
}

export function useCreateTask() {
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: NewTask) => createTask(supabase, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useUpdateTask() {
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<NewTask> }) =>
      updateTask(supabase, id, updates),
    onSuccess: (_res: TodoTask) =>
      queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useDeleteTask() {
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTask(supabase, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });
}
