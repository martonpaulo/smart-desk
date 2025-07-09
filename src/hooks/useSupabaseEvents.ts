import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSupabaseClient } from '@/lib/supabaseClient';
import {
  createEvent,
  deleteEvent,
  fetchEvents,
  updateEvent,
  type NewEvent,
} from '@/services/supabaseEventsService';
import type { IEvent } from '@/types/IEvent';

export function useEvents() {
  const supabase = useSupabaseClient();
  return useQuery({
    queryKey: ['events'],
    queryFn: () => fetchEvents(supabase),
  });
}

export function useCreateEvent() {
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: NewEvent) => createEvent(supabase, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  });
}

export function useUpdateEvent() {
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<NewEvent> }) =>
      updateEvent(supabase, id, updates),
    onSuccess: (_res: IEvent) =>
      queryClient.invalidateQueries({ queryKey: ['events'] }),
  });
}

export function useDeleteEvent() {
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEvent(supabase, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  });
}
