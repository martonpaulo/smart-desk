import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useSupabaseClient } from '@/lib/supabaseClient';
import {
  createColumn,
  deleteColumn,
  fetchColumns,
  type NewColumn,
  updateColumn,
} from '@/services/supabaseColumnsService';
import type { Column } from '@/widgets/TodoList/types';

export function useColumns() {
  const supabase = useSupabaseClient();
  return useQuery({
    queryKey: ['columns'],
    queryFn: () => fetchColumns(supabase),
  });
}

export function useCreateColumn() {
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: NewColumn) => createColumn(supabase, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['columns'] }),
  });
}

export function useUpdateColumn() {
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<NewColumn> }) =>
      updateColumn(supabase, id, updates),
    onSuccess: (_res: Column) => queryClient.invalidateQueries({ queryKey: ['columns'] }),
  });
}

export function useDeleteColumn() {
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteColumn(supabase, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['columns'] }),
  });
}
