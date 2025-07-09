'use client';

import { ReactNode, useEffect } from 'react';

import { isSupabaseLoggedIn } from '@/hooks/useSupabaseAuth';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { createEvent, fetchEvents } from '@/services/supabaseEventsService';
import { createTask, fetchTasks } from '@/services/supabaseTasksService';
import { useEventStore } from '@/store/eventStore';
import { useTodoBoardStore } from '@/store/todoBoardStore';
import { loadLocalEvents, saveLocalEvents } from '@/utils/localEventsStorage';
import { loadBoard, saveBoard } from '@/widgets/TodoList/boardStorage';

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
        const eventStore = useEventStore.getState();
        const boardStore = useTodoBoardStore.getState();

        const remoteEvents = await fetchEvents(supabase);
        const localEvents = loadLocalEvents();
        const localEventIds = new Set(localEvents.map(e => e.id));

        for (const re of remoteEvents) {
          if (!localEventIds.has(re.id)) {
            localEvents.push(re);
            eventStore.addLocalEvent(re);
          }
        }

        saveLocalEvents(localEvents);

        const eventIds = new Set(remoteEvents.map(e => e.id));
        for (const ev of localEvents) {
          if (!eventIds.has(ev.id)) {
            console.debug('Sync: pushing local event', ev);
            await createEvent(supabase, {
              id: ev.id,
              start: ev.start,
              end: ev.end,
              title: ev.title,
              attendeeCount: ev.attendeeCount,
              calendar: ev.calendar?.id,
              aknowledged: ev.aknowledged,
            });
          }
        }

        const remoteTasks = await fetchTasks(supabase);
        const board = loadBoard();
        const localTaskIds = new Set(board.tasks.map(t => t.id));

        for (const rt of remoteTasks) {
          if (!localTaskIds.has(rt.id)) {
            board.tasks.push(rt);
          }
        }

        const taskIds = new Set(remoteTasks.map(t => t.id));
        for (const task of board.tasks) {
          if (!taskIds.has(task.id)) {
            console.debug('Sync: pushing local task', task);
            await createTask(supabase, {
              id: task.id,
              title: task.title,
              description: task.description,
              tags: task.tags,
              columnId: task.columnId,
              quantity: task.quantity,
              quantityTotal: task.quantityTotal,
            });
          }
        }

        if (remoteTasks.length !== board.tasks.length) {
          boardStore.setBoard(board);
        }

        saveBoard(board);
      } catch (err) {
        console.error('Supabase sync failed', err);
      }
    }

    void sync();
  }, []);

  return <>{children}</>;
}
