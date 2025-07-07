import { useCallback, useEffect, useRef, useState } from 'react';

import ListIcon from '@mui/icons-material/List';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import { Box, Button, Stack } from '@mui/material';

// Ensure drag and drop works on Safari PWAs
import '@/lib/dragDropTouch';

import { IEvent } from '@/types/IEvent';
import { filterFullDayEventsForTodayInUTC } from '@/utils/eventUtils';
import { getStoredFilters, setStoredFilters } from '@/utils/localStorageUtils';
import { LAST_POPULATE_KEY, loadBoard, saveBoard } from '@/widgets/TodoList/boardStorage';
import { ColumnModal } from '@/widgets/TodoList/ColumnModal';
import { EditTaskModal } from '@/widgets/TodoList/EditTaskModal';
import { TodoColumn } from '@/widgets/TodoList/TodoColumn';
import { TrashDialog } from '@/widgets/TodoList/TrashDialog';
import { BoardState, Column, TodoTask } from '@/widgets/TodoList/types';

interface TodoListProps {
  events: IEvent[] | null;
}

export function TodoList({ events }: TodoListProps) {
  const [board, setBoard] = useState<BoardState>(() => loadBoard());
  const [view, setView] = useState<'board' | 'list'>('board');
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
  const [trashOpen, setTrashOpen] = useState(false);

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
          columnId: 'todo',
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
          columnId: 'todo',
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

  const handleAddTask = (columnId: string, title: string) => {
    const task: TodoTask = {
      id: `todo-${Date.now()}`,
      title,
      tags: [],
      columnId,
    };
    setBoard(prev => ({ ...prev, tasks: [...prev.tasks, task] }));
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
      const tasks = prev.tasks.filter(i => i.columnId === id);
      return {
        columns: prev.columns.filter(c => c.id !== id),
        tasks: prev.tasks.filter(i => i.columnId !== id),
        trash: {
          columns: column ? [column, ...prev.trash.columns] : prev.trash.columns,
          tasks: [...tasks, ...prev.trash.tasks],
        },
      };
    });
    setColumnModal(null);
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
      const tasks = prev.trash.tasks.filter(t => t.columnId === id);
      return {
        ...prev,
        columns: [...prev.columns, column],
        tasks: [...prev.tasks, ...tasks],
        trash: {
          columns: prev.trash.columns.filter(c => c.id !== id),
          tasks: prev.trash.tasks.filter(t => t.columnId !== id),
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

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, columnId: string) => {
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
        : tasks.reduce((idx, it, i) => (it.columnId === columnId ? i + 1 : idx), 0);
      const insertIndex = from < to ? to - 1 : to;
      tasks.splice(insertIndex, 0, { ...moved, columnId });
      return { ...prev, tasks };
    });
  };

  const renderColumn = (column: Column) => {
    const tasks = board.tasks?.filter(i => i.columnId === column.id);

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
      />
    );
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Stack direction="row" spacing={1} mb={2} alignItems="center">
        <Box flexGrow={1} />
        <Button variant="outlined" size="small" onClick={() => setTrashOpen(true)}>
          Trash
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={view === 'board' ? <ListIcon /> : <ViewColumnIcon />}
          onClick={() => setView(v => (v === 'board' ? 'list' : 'board'))}
        >
          {view === 'board' ? 'List view' : 'Board view'}
        </Button>
      </Stack>

      <Stack
        direction={view === 'board' ? 'row' : 'column'}
        spacing={2}
        sx={{ userSelect: 'none' }}
      >
        {board.columns.map(renderColumn)}
      </Stack>
      <EditTaskModal
        column={board.columns.find(c => c.id === editingTask?.columnId) || null}
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
