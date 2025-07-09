'use client';

import { ReactNode, useEffect } from 'react';

import { getSupabaseClient } from '@/lib/supabaseClient';
import { isSupabaseLoggedIn } from '@/hooks/useSupabaseAuth';
import { loadLocalEvents } from '@/utils/localEventsStorage';
import { loadBoard } from '@/widgets/TodoList/boardStorage';
import {
  createEvent,
  fetchEvents,
} from '@/services/supabaseEventsService';
import {
  createTask,
  fetchTasks,
} from '@/services/supabaseTasksService';

interface Props {
  children: ReactNode;
}

export function SupabaseSyncProvider({ children }: Props) {
  useEffect(() => {
    async function sync() {
      const supabase = getSupabaseClient();
      const loggedIn = await isSupabaseLoggedIn();
      if (!loggedIn) {
        console.warn('Supabase sync skipped: no session');
        return;
      }
      try {
        const remoteEvents = await fetchEvents(supabase);
        const eventIds = new Set(remoteEvents.map(e => e.id));
        const localEvents = loadLocalEvents();
        for (const ev of localEvents) {
          if (!eventIds.has(ev.id)) {
            console.debug('Sync: pushing local event', ev);
            await createEvent(supabase, {
              start: ev.start,
              end: ev.end,
              title: ev.title,
              attendeeCount: ev.attendeeCount,
              calendar: ev.calendar,
              aknowledged: ev.aknowledged,
            });
          }
        }

        const remoteTasks = await fetchTasks(supabase);
        const taskIds = new Set(remoteTasks.map(t => t.id));
        const board = loadBoard();
        for (const task of board.tasks) {
          if (!taskIds.has(task.id)) {
            console.debug('Sync: pushing local task', task);
            await createTask(supabase, {
              title: task.title,
              description: task.description,
              tags: task.tags,
              columnId: task.columnId,
              quantity: task.quantity,
              quantityTotal: task.quantityTotal,
            });
          }
        }
      } catch (err) {
        console.error('Supabase sync failed', err);
      }
    }

    void sync();
  }, []);

  return <>{children}</>;
}
