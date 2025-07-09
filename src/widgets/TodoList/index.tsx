import { useCallback, useEffect, useRef, useState } from 'react';

import { Box, Stack, useMediaQuery } from '@mui/material';

import { getSupabaseClient } from '@/lib/supabaseClient';
import { fetchColumns } from '@/services/supabaseColumnsService';
import { fetchTasks } from '@/services/supabaseTasksService';
import { useTodoBoardStore } from '@/store/todoBoardStore';
import { useTodoPrefsStore } from '@/store/todoPrefsStore';
import { showUndo } from '@/store/undoStore';
import { IEvent } from '@/types/IEvent';
import { filterFullDayEventsForTodayInUTC } from '@/utils/eventUtils';
import { generateId } from '@/utils/idUtils';
import { getStoredFilters, setStoredFilters } from '@/utils/localStorageUtils';
import { AddTaskInput } from '@/widgets/TodoList/AddTaskInput';
import { LAST_POPULATE_KEY, saveBoard } from '@/widgets/TodoList/boardStorage';
import { ColumnModal } from '@/widgets/TodoList/ColumnModal';
import { EditTaskModal } from '@/widgets/TodoList/EditTaskModal';
import { TodoColumn } from '@/widgets/TodoList/TodoColumn';
import { TrashDialog } from '@/widgets/TodoList/TrashDialog';
import { BoardState, Column, TodoTask } from '@/widgets/TodoList/types';

// Ensure drag and drop works on Safari PWAs
import '@/lib/dragDropTouch';

interface TodoListProps {
  events: IEvent[] | null;
}

export function TodoList({ events }: TodoListProps) {
  const boardStoreBoard = useTodoBoardStore(state => state.board);
  const setBoardInStore = useTodoBoardStore(state => state.setBoard);
  const [board, setBoard] = useState<BoardState>(boardStoreBoard);
  const view = useTodoPrefsStore(state => state.view);
  const trashOpen = useTodoPrefsStore(state => state.trashOpen);
  const setTrashOpen = useTodoPrefsStore(state => state.setTrashOpen);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [draggingColumnId, setDraggingColumnId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<TodoTask | null>(null);
  const [columnModal, setColumnModal] = useState<{
    column: Column | null;
    afterId?: string;
  } | null>(null);
  const [hoverTaskId, setHoverTaskId] = useState<string | null>(null);
  const [taskDropColumnId, setTaskDropColumnId] = useState<string | null>(null);
  const [hoverColumnId, setHoverColumnId] = useState<string | null>(null);
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('mobileLg'));

  // Periodically sync board with Supabase every minute
  useEffect(() => {
    const supabase = getSupabaseClient();
    let cancelled = false;

    async function refresh() {
      try {
        const [columns, tasks] = await Promise.all([fetchColumns(supabase), fetchTasks(supabase)]);
        if (cancelled) return;
        setBoard(prev => ({ ...prev, columns: columns.length ? columns : prev.columns, tasks }));
      } catch (err) {
        console.error('Failed to refresh board from Supabase', err);
      }
    }

    void refresh();
    const id = setInterval(refresh, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  // keep global store in sync
  useEffect(() => {
    setBoardInStore(board);
  }, [board, setBoardInStore]);

  // Populate tasks from today's events once per day
  useEffect(() => {
    if (!events?.length) return;

    const todayKey = new Date().toISOString().slice(0, 10);
    const lastPopulate = getStoredFilters<string>(LAST_POPULATE_KEY);
    if (lastPopulate === todayKey) return;

    const fullDay = filterFullDayEventsForTodayInUTC(events);
    if (!fullDay.length) return;

    setBoard(prev => {
      const additions = fullDay
        .filter(ev => !prev.tasks.some(t => t.id === ev.id))
        .map(ev => ({
          id: ev.id,
          title: ev.title,
          description: undefined,
          tags: [],
          columnSlug: 'todo',
        }));
      if (!additions.length) return prev;
      const updated = { ...prev, tasks: [...prev.tasks, ...additions] };
      saveBoard(updated);
      return updated;
    });

    setStoredFilters(LAST_POPULATE_KEY, todayKey);
  }, [events]);

  // history refs
  const historyRef = useRef<BoardState[]>([board]);
  const historyIndexRef = useRef(0);
  const isTimeTravelingRef = useRef(false);

  // push new states into history (skip when undo/redo)
  useEffect(() => {
    if (isTimeTravelingRef.current) {
      isTimeTravelingRef.current = false;
      return;
    }
    const sliced = historyRef.current.slice(0, historyIndexRef.current + 1);
    sliced.push(board);
    historyRef.current = sliced;
    historyIndexRef.current = sliced.length - 1;
  }, [board]);

  // undo callback
  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current--;
    isTimeTravelingRef.current = true;
    setBoard(historyRef.current[historyIndexRef.current]);
  }, []);

  // redo callback
  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current++;
    isTimeTravelingRef.current = true;
    setBoard(historyRef.current[historyIndexRef.current]);
  }, []);

  // keyboard listeners for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const ctrl = isMac ? e.metaKey : e.ctrlKey;
      if (!ctrl) return;

      // undo: Ctrl+Z or Cmd+Z
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // redo: Ctrl+Y or Cmd+Y
      if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // populate from full-day events once per day
  useEffect(() => {
    if (!events?.length) return;
    const todayKey = new Date().toISOString().slice(0, 10);
    const last = getStoredFilters<string>(LAST_POPULATE_KEY);
    if (last === todayKey) return;

    const fullDay = filterFullDayEventsForTodayInUTC(events);
    if (!fullDay.length) return;

    setBoard(prev => {
      const additions = fullDay
        .filter(ev => !prev.tasks.some(i => i.id === ev.id))
        .map(ev => ({
          id: ev.id,
          title: ev.title,
          description: undefined,
          tags: [],
          columnSlug: 'todo',
        }));
      if (!additions.length) return prev;
      const updated = { ...prev, tasks: [...prev.tasks, ...additions] };
      saveBoard(updated);
      return updated;
    });
    setStoredFilters(LAST_POPULATE_KEY, todayKey);
  }, [events]);

  // persist on every change
  useEffect(() => {
    saveBoard(board);
  }, [board]);

  const handleAddTask = (columnSlug: string, title: string) => {
    const task: TodoTask = {
      id: generateId(),
      title,
      tags: [],
      columnSlug,
    };
    setBoard(prev => {
      let columns = prev.columns;
      if (!columns.some(c => c.id === columnSlug)) {
        columns = [...columns, { id: columnSlug, title: 'Draft', color: '#616161' }];
      }
      return { ...prev, columns, tasks: [...prev.tasks, task] };
    });
    return task.id;
  };

  const handleEditTask = (id: string) => {
    const task = board.tasks.find(t => t.id === id);
    if (!task) return;
    setEditingTask(task);
  };

  const handleSaveTask = (updated: TodoTask) => {
    setBoard(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => (t.id === updated.id ? updated : t)),
    }));
    setEditingTask(null);
  };

  const handleRenameTask = (id: string, title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setBoard(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => (t.id === id ? { ...t, title: trimmed } : t)),
    }));
  };

  const handleDeleteTask = (id: string) => {
    setBoard(prev => {
      const task = prev.tasks.find(t => t.id === id);
      if (!task) return prev;
      return {
        ...prev,
        tasks: prev.tasks.filter(t => t.id !== id),
        trash: { ...prev.trash, tasks: [task, ...prev.trash.tasks] },
      };
    });
    showUndo('Task deleted', undo);
  };

  const handleToggleDone = (id: string) => {
    setBoard(prev => {
      const task = prev.tasks.find(t => t.id === id);
      if (!task) return prev;

      let columns = [...prev.columns];
      let needsColumnUpdate = false;

      const ensureColumn = (cid: string, title: string, color: string) => {
        if (!columns.some(c => c.id === cid)) {
          columns = [...columns, { id: cid, title, color }];
          needsColumnUpdate = true;
        }
      };

      // Only ensure 'done' column if moving to it
      if (task.columnSlug !== 'done') {
        ensureColumn('done', 'Done', '#2e7d32');
      }

      // Only ensure 'draft' column if we need to move back to it
      if (
        task.columnSlug === 'done' &&
        (!task.prevColumnSlug || !columns.some(c => c.id === task.prevColumnSlug))
      ) {
        ensureColumn('draft', 'Draft', '#616161');
      }

      const tasks = prev.tasks.map(t => {
        if (t.id !== id) return t;
        if (t.columnSlug === 'done') {
          const target =
            t.prevColumnSlug && columns.some(c => c.id === t.prevColumnSlug)
              ? t.prevColumnSlug
              : 'draft';
          return { ...t, columnSlug: target, prevColumnSlug: undefined };
        }

        if (t.quantity && t.quantity > 1) {
          return { ...t, quantity: t.quantity - 1 };
        }

        return { ...t, prevColumnSlug: t.columnSlug, columnSlug: 'done' };
      });

      return needsColumnUpdate ? { ...prev, columns, tasks } : { ...prev, tasks };
    });
  };

  const handleSaveColumn = (title: string, color: string) => {
    if (!columnModal) return;
    if (columnModal.column) {
      const id = columnModal.column.id;
      setBoard(prev => ({
        ...prev,
        columns: prev.columns.map(c => (c.id === id ? { ...c, title, color } : c)),
      }));
    } else {
      const id = `col-${Date.now()}`;
      setBoard(prev => {
        const columns = [...prev.columns];
        const index = columnModal.afterId
          ? columns.findIndex(c => c.id === columnModal.afterId) + 1
          : columns.length;
        columns.splice(index, 0, { id, title, color });
        return { ...prev, columns };
      });
    }
    setColumnModal(null);
  };

  const handleDeleteColumn = () => {
    if (!columnModal?.column) {
      setColumnModal(null);
      return;
    }
    const id = columnModal.column.id;
    setBoard(prev => {
      const column = prev.columns.find(c => c.id === id);
      const tasks = prev.tasks.filter(i => i.columnSlug === id);
      return {
        columns: prev.columns.filter(c => c.id !== id),
        tasks: prev.tasks.filter(i => i.columnSlug !== id),
        trash: {
          columns: column ? [column, ...prev.trash.columns] : prev.trash.columns,
          tasks: [...tasks, ...prev.trash.tasks],
        },
      };
    });
    setColumnModal(null);
    showUndo('Column deleted', undo);
  };

  const handleRestoreTask = (id: string) => {
    setBoard(prev => {
      const task = prev.trash.tasks.find(t => t.id === id);
      if (!task) return prev;
      return {
        ...prev,
        tasks: [...prev.tasks, task],
        trash: { ...prev.trash, tasks: prev.trash.tasks.filter(t => t.id !== id) },
      };
    });
  };

  const handleRestoreColumn = (id: string) => {
    setBoard(prev => {
      const column = prev.trash.columns.find(c => c.id === id);
      if (!column) return prev;
      const tasks = prev.trash.tasks.filter(t => t.columnSlug === id);
      return {
        ...prev,
        columns: [...prev.columns, column],
        tasks: [...prev.tasks, ...tasks],
        trash: {
          columns: prev.trash.columns.filter(c => c.id !== id),
          tasks: prev.trash.tasks.filter(t => t.columnSlug !== id),
        },
      };
    });
  };

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, id: string) => {
    event.dataTransfer.effectAllowed = 'move';
    setDraggingId(id);
    setHoverTaskId(null);
    setTaskDropColumnId(null);
  };

  const handleColumnDragStart = (event: React.DragEvent<HTMLDivElement>, id: string) => {
    event.dataTransfer.effectAllowed = 'move';
    setDraggingColumnId(id);
    setHoverColumnId(null);
  };

  const handleColumnDragOver = (event: React.DragEvent<HTMLDivElement>, overId: string) => {
    if (!draggingColumnId || draggingColumnId === overId) return;
    setHoverColumnId(overId);
  };

  const handleColumnDragEnd = () => {
    if (draggingColumnId) {
      setBoard(prev => {
        const columns = [...prev.columns];
        const from = columns.findIndex(c => c.id === draggingColumnId);
        const to = hoverColumnId ? columns.findIndex(c => c.id === hoverColumnId) : from;
        if (from === -1 || to === -1 || from === to) return prev;
        const [moved] = columns.splice(from, 1);
        columns.splice(to, 0, moved);
        return { ...prev, columns };
      });
    }
    setDraggingColumnId(null);
    setHoverColumnId(null);
  };

  const handleDragOverTask = (event: React.DragEvent<HTMLDivElement>, overId: string) => {
    event.preventDefault();
    if (!draggingId || draggingId === overId) return;
    setHoverTaskId(overId);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, columnSlug: string) => {
    event.preventDefault();
    const id = draggingId;
    setDraggingId(null);
    const overId = hoverTaskId;
    setHoverTaskId(null);
    setTaskDropColumnId(null);
    if (!id) return;
    setBoard(prev => {
      const tasks = [...prev.tasks];
      const from = tasks.findIndex(i => i.id === id);
      if (from === -1) return prev;
      const [moved] = tasks.splice(from, 1);
      const to = overId
        ? tasks.findIndex(i => i.id === overId)
        : tasks.reduce((idx, it, i) => (it.columnSlug === columnSlug ? i + 1 : idx), 0);
      const insertIndex = from < to ? to - 1 : to;
      tasks.splice(insertIndex, 0, { ...moved, columnSlug });
      return { ...prev, tasks };
    });
  };

  const renderColumn = (column: Column) => {
    const tasks = board.tasks?.filter(i => i.columnSlug === column.id);

    return (
      <TodoColumn
        key={column.id}
        column={column}
        tasks={tasks}
        view={view}
        onOpenColumn={col => setColumnModal({ column: col })}
        onAddColumn={afterId => setColumnModal({ column: null, afterId })}
        onEditTask={handleEditTask}
        onRenameTask={handleRenameTask}
        onDeleteTask={handleDeleteTask}
        onToggleDone={handleToggleDone}
        onAddTask={handleAddTask}
        onDragStart={handleDragStart}
        onDragOverTask={handleDragOverTask}
        onTaskColumnDragOver={setTaskDropColumnId}
        onDrop={handleDrop}
        onColumnDragStart={handleColumnDragStart}
        onColumnDragOver={handleColumnDragOver}
        onColumnDragEnd={handleColumnDragEnd}
        draggingTaskId={draggingId}
        hoverTaskId={hoverTaskId}
        taskDropColumnId={taskDropColumnId}
        draggingColumnId={draggingColumnId}
        showAddTaskInput={!isMobile}
      />
    );
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Stack
        direction={view === 'board' ? 'row' : 'column'}
        spacing={2}
        sx={{ userSelect: 'none' }}
      >
        {board.columns.map(renderColumn)}
      </Stack>
      <EditTaskModal
        column={board.columns.find(c => c.id === editingTask?.columnSlug) || null}
        open={Boolean(editingTask)}
        task={editingTask}
        onSave={handleSaveTask}
        onClose={() => setEditingTask(null)}
        onDeleteTask={handleDeleteTask}
      />
      <ColumnModal
        open={Boolean(columnModal)}
        column={columnModal?.column || null}
        onSave={handleSaveColumn}
        onDelete={handleDeleteColumn}
        onClose={() => setColumnModal(null)}
      />
      <TrashDialog
        open={trashOpen}
        tasks={board.trash.tasks}
        columns={board.trash.columns}
        onRestoreTask={handleRestoreTask}
        onRestoreColumn={handleRestoreColumn}
        onClose={() => setTrashOpen(false)}
      />

      {isMobile && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 16,
            left: 16,
            right: 16,
          }}
        >
          <AddTaskInput columnSlug="draft" columnColor="#f0f0f0" onAdd={handleAddTask} />
        </Box>
      )}

      <style jsx>{`
        .todo-actions {
          position: absolute;
          right: 0.25rem;
          top: 0.25rem;
        }
        [data-todo-id]:hover .todo-actions {
          visibility: visible;
        }
        .todo-actions button:hover {
          cursor: pointer;
        }
      `}</style>
    </Box>
  );
}
