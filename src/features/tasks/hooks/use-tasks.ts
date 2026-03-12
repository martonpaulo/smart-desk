import { useQuery } from '@tanstack/react-query';

import { getTasks } from '@/features/tasks/logic/get-tasks';

export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: getTasks,
  });
}
