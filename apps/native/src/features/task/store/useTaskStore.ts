import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { supabase, handleSupabaseError, TABLES } from 'src/config/supabase';
import {
  Task,
  CreateTaskData,
  UpdateTaskData,
  TaskFilters,
} from '@smart-desk/types';
import { TaskStore } from 'src/features/task/types/TaskTypes';

export const useTaskStore = create<TaskStore>()(
  devtools(
    (set, get) => ({
      tasks: [],
      isLoading: false,
      error: null,
      filters: {
        status: 'all',
      },

      addTask: async (taskData: CreateTaskData) => {
        set({ isLoading: true, error: null });
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) throw new Error('User not authenticated');

          const { data, error } = await supabase
            .from(TABLES.TASKS)
            .insert([
              {
                ...taskData,
                user_id: user.id,
                important: taskData.important || false,
                urgent: taskData.urgent || false,
                blocked: taskData.blocked || false,
                quantity_done: 0,
                quantity_target: taskData.quantityTarget || 1,
                daily: taskData.daily || false,
                position: 0,
                estimated_time: taskData.estimatedTime,
                planned_date: taskData.plannedDate?.toISOString(),
                classified_date: null,
                column_id: taskData.columnId,
                event_id: taskData.eventId,
                tag_id: taskData.tagId,
              },
            ])
            .select()
            .single();

          if (error) {
            throw new Error(handleSupabaseError(error));
          }

          // Convert database format to app format
          const newTask: Task = {
            id: data.id,
            title: data.title,
            notes: data.notes,
            important: data.important,
            urgent: data.urgent,
            blocked: data.blocked,
            plannedDate: data.planned_date ? new Date(data.planned_date) : null,
            estimatedTime: data.estimated_time,
            quantityDone: data.quantity_done,
            quantityTarget: data.quantity_target,
            daily: data.daily,
            position: data.position,
            classifiedDate: data.classified_date
              ? new Date(data.classified_date)
              : null,
            columnId: data.column_id,
            eventId: data.event_id,
            tagId: data.tag_id,
            trashed: data.trashed,
            updatedAt: new Date(data.updated_at),
            isSynced: true,
          };

          set(state => ({
            tasks: [...state.tasks, newTask],
            isLoading: false,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : 'Failed to add task',
            isLoading: false,
          });
        }
      },

      updateTask: async (taskData: UpdateTaskData) => {
        set({ isLoading: true, error: null });
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) throw new Error('User not authenticated');

          const updateData: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
          };

          if (taskData.title !== undefined) updateData.title = taskData.title;
          if (taskData.notes !== undefined) updateData.notes = taskData.notes;
          if (taskData.important !== undefined)
            updateData.important = taskData.important;
          if (taskData.urgent !== undefined)
            updateData.urgent = taskData.urgent;
          if (taskData.blocked !== undefined)
            updateData.blocked = taskData.blocked;
          if (taskData.plannedDate !== undefined)
            updateData.planned_date = taskData.plannedDate?.toISOString();
          if (taskData.estimatedTime !== undefined)
            updateData.estimated_time = taskData.estimatedTime;
          if (taskData.quantityTarget !== undefined)
            updateData.quantity_target = taskData.quantityTarget;
          if (taskData.daily !== undefined) updateData.daily = taskData.daily;
          if (taskData.columnId !== undefined)
            updateData.column_id = taskData.columnId;
          if (taskData.eventId !== undefined)
            updateData.event_id = taskData.eventId;
          if (taskData.tagId !== undefined) updateData.tag_id = taskData.tagId;

          const { data, error } = await supabase
            .from(TABLES.TASKS)
            .update(updateData)
            .eq('id', taskData.id)
            .eq('user_id', user.id)
            .select()
            .single();

          if (error) {
            throw new Error(handleSupabaseError(error));
          }

          // Convert database format to app format
          const updatedTask: Task = {
            id: data.id,
            title: data.title,
            notes: data.notes,
            important: data.important,
            urgent: data.urgent,
            blocked: data.blocked,
            plannedDate: data.planned_date ? new Date(data.planned_date) : null,
            estimatedTime: data.estimated_time,
            quantityDone: data.quantity_done,
            quantityTarget: data.quantity_target,
            daily: data.daily,
            position: data.position,
            classifiedDate: data.classified_date
              ? new Date(data.classified_date)
              : null,
            columnId: data.column_id,
            eventId: data.event_id,
            tagId: data.tag_id,
            trashed: data.trashed,
            updatedAt: new Date(data.updated_at),
            isSynced: true,
          };

          set(state => ({
            tasks: state.tasks.map(task =>
              task.id === taskData.id ? updatedTask : task
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : 'Failed to update task',
            isLoading: false,
          });
        }
      },

      deleteTask: async (taskId: string) => {
        set({ isLoading: true, error: null });
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) throw new Error('User not authenticated');

          const { error } = await supabase
            .from(TABLES.TASKS)
            .delete()
            .eq('id', taskId)
            .eq('user_id', user.id);

          if (error) {
            throw new Error(handleSupabaseError(error));
          }

          set(state => ({
            tasks: state.tasks.filter(task => task.id !== taskId),
            isLoading: false,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : 'Failed to delete task',
            isLoading: false,
          });
        }
      },

      toggleTaskComplete: async (taskId: string) => {
        const task = get().tasks.find(t => t.id === taskId);
        if (!task) return;

        const isCompleted = task.quantityDone >= task.quantityTarget;
        const newQuantityDone = isCompleted ? 0 : task.quantityTarget;

        // Update the task directly in the store for now
        // In a real app, you'd want to update this on the server
        set(state => ({
          tasks: state.tasks.map(t =>
            t.id === taskId
              ? {
                  ...t,
                  quantityDone: newQuantityDone,
                  updatedAt: new Date(),
                  isSynced: false,
                }
              : t
          ),
        }));
      },

      fetchTasks: async () => {
        set({ isLoading: true, error: null });
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) throw new Error('User not authenticated');

          const { data, error } = await supabase
            .from(TABLES.TASKS)
            .select('*')
            .eq('user_id', user.id)
            .eq('trashed', false)
            .order('created_at', { ascending: false });

          if (error) {
            throw new Error(handleSupabaseError(error));
          }

          // Convert database format to app format
          const tasks: Task[] = (data || []).map(
            (item: Record<string, unknown>) => ({
              id: item.id as string,
              title: item.title as string,
              notes: item.notes as string | null,
              important: item.important as boolean,
              urgent: item.urgent as boolean,
              blocked: item.blocked as boolean,
              plannedDate: item.planned_date
                ? new Date(item.planned_date as string)
                : null,
              estimatedTime: item.estimated_time as number | null,
              quantityDone: item.quantity_done as number,
              quantityTarget: item.quantity_target as number,
              daily: item.daily as boolean,
              position: item.position as number,
              classifiedDate: item.classified_date
                ? new Date(item.classified_date as string)
                : null,
              columnId: (item.column_id as string) || '',
              eventId: item.event_id as string | null,
              tagId: item.tag_id as string | null,
              trashed: item.trashed as boolean,
              updatedAt: new Date(item.updated_at as string),
              isSynced: true,
            })
          );

          set({ tasks, isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : 'Failed to fetch tasks',
            isLoading: false,
          });
        }
      },

      refreshTasks: async () => {
        await get().fetchTasks();
      },

      setFilters: (filters: Partial<TaskFilters>) => {
        set(state => ({
          filters: { ...state.filters, ...filters },
        }));
      },

      clearFilters: () => {
        set({ filters: { status: 'all' } });
      },

      setLoading: (isLoading: boolean) => set({ isLoading }),
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    { name: 'task-store' }
  )
);
