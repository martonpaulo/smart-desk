import { useState } from 'react';

import { Button, Stack } from '@mui/material';

import { ColumnModal } from '@/components/column/ColumnModal';
import { TodoColumn } from '@/components/column/TodoColumn';
import { AddTaskFloatButton } from '@/components/task/AddTaskFloatButton';
import { TaskModal } from '@/components/task/TaskModal';
import { defaultColumns } from '@/config/defaultColumns';
import { useResponsiveness } from '@/hooks/useResponsiveness';
import { useTasks } from '@/hooks/useTasks';
import { useBoardStore } from '@/store/board/store';
import { useSyncStatusStore } from '@/store/syncStatus';
import { useTodoPrefsStore } from '@/store/todoPrefsStore';
import { Column } from '@/types/column';
import { Task } from '@/types/task';
import { getNewColumnPosition } from '@/utils/boardHelpers';

// Safari PWA drag-drop fix
import '@/lib/dragDropTouch';

interface TodoListProps {
  showDate?: boolean;
}

export function TodoList({ showDate }: TodoListProps) {
  const syncStatus = useSyncStatusStore(s => s.status);
  const { activeTasks: tasks } = useTasks({ date: new Date() });

  // store selectors
  const columns = useBoardStore(s => s.columns);
  const addColumn = useBoardStore(s => s.addColumn);
  const addTask = useBoardStore(s => s.addTask);
  const updateColumn = useBoardStore(s => s.updateColumn);
  const updateTask = useBoardStore(s => s.updateTask);

  const { isMobile } = useResponsiveness();

  // column modal state
  const [isColumnModalOpen, setColumnModalOpen] = useState(false);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [insertionPosition, setInsertionPosition] = useState<number>();
  // task drag state
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [hoverTaskId, setHoverTaskId] = useState<string | null>(null);
  const [taskDropColumnId, setTaskDropColumnId] = useState<string | null>(null);
  // **new** column drag state
  const [draggingColumnId, setDraggingColumnId] = useState<string | null>(null);
  const [hoverColumnId, setHoverColumnId] = useState<string | null>(null);

  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const hideDoneColumn = useTodoPrefsStore(state => state.hideDoneColumn);
  const hiddenColumnIds = useTodoPrefsStore(state => state.hiddenColumnIds);
  const toggleHiddenColumn = useTodoPrefsStore(state => state.toggleHiddenColumn);

  const columnsToRender = columns.filter(c => {
    if (c.trashed) return false;
    if (hideDoneColumn && c.title === defaultColumns.done.title) return false;
    if (hiddenColumnIds && hiddenColumnIds.includes(c.id)) return false;
    return true;
  });
  const boardIsEmpty = columnsToRender.length === 0;

  // ── Column modal open/close ─────────────────────────────────────────────
  const openNewColumnModal = () => {
    setActiveColumn(null);
    setInsertionPosition(undefined);
    setColumnModalOpen(true);
  };
  const openEditColumnModal = (col: Column) => {
    setActiveColumn(col);
    setInsertionPosition(undefined);
    setColumnModalOpen(true);
  };
  const openInsertColumnModal = (prevPos: number) => {
    setActiveColumn(null);
    setInsertionPosition(getNewColumnPosition(columns, prevPos));
    setColumnModalOpen(true);
  };
  const closeColumnModal = () => {
    setActiveColumn(null);
    setInsertionPosition(undefined);
    setColumnModalOpen(false);
  };

  // ── Column save/delete ─────────────────────────────────────────────────
  const handleSaveColumn = async (title: string, color: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;

    try {
      if (activeColumn) {
        await updateColumn({ id: activeColumn.id, title: trimmed, color, updatedAt: new Date() });
      } else {
        const pos =
          insertionPosition !== undefined ? insertionPosition : getNewColumnPosition(columns);
        addColumn({ title: trimmed, color, position: pos, updatedAt: new Date() });
      }
    } catch (err) {
      console.error('Column save failed', err);
    } finally {
      closeColumnModal();
    }
  };

  const handleDeleteColumn = async (id: string) => {
    try {
      await updateColumn({ id, trashed: true, updatedAt: new Date() });
    } catch (err) {
      console.error('Column delete failed', err);
    }
  };

  // ── Task handlers (unchanged) ───────────────────────────────────────────
  const handleAddTask = async (task: Partial<Task>): Promise<string> => {
    try {
      return await addTask({
        // Default title that will be overridden if task.title exists
        title: 'New Task',
        ...task,
        updatedAt: new Date(),
      });
    } catch (err) {
      console.error('Task add failed', err);
      return '';
    }
  };

  const handleEditTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    setEditingTask(task);
  };

  const handleRenameTask = async (id: string, title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    try {
      await updateTask({ id, title: trimmed, updatedAt: new Date() });
    } catch (err) {
      console.error('Task rename failed', err);
    }
  };

  const handleToggleDone = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const now = new Date();
    const next = task.quantityDone + 1;
    const value = next > task.quantityTarget ? 0 : next;
    let taskColumnId = task.columnId;

    if (value === task.quantityTarget) {
      const doneColumn = columns.find(c => c.title === defaultColumns.done.title);

      if (doneColumn) {
        taskColumnId = doneColumn.id;
        if (doneColumn.trashed) {
          await updateColumn({ id: doneColumn.id, trashed: false, updatedAt: now });
        }
      } else {
        taskColumnId = await addColumn({
          title: defaultColumns.done.title,
          color: defaultColumns.done.color,
          updatedAt: now,
        });
      }
    }

    if (value === 0) {
      const todoColumn = columns.find(c => c.title === defaultColumns.todo.title);

      if (todoColumn) {
        taskColumnId = todoColumn.id;
        if (todoColumn.trashed) {
          await updateColumn({ id: todoColumn.id, trashed: false, updatedAt: now });
        }
      } else {
        taskColumnId = await addColumn({
          title: defaultColumns.todo.title,
          color: defaultColumns.todo.color,
          updatedAt: now,
        });
      }
    }

    // just update done count
    await updateTask({ id, columnId: taskColumnId, quantityDone: value, updatedAt: now });
    return;
  };

  // ── Task drag & drop ────────────────────────────────────────────────────
  const handleTaskDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    if (isMobile) return; // disable drag on mobile
    e.dataTransfer.effectAllowed = 'move';
    setDraggingTaskId(id);
    setHoverTaskId(null);
    setTaskDropColumnId(null);
  };
  const handleTaskDragOver = (e: React.DragEvent<HTMLDivElement>, overId: string) => {
    if (isMobile) return;
    e.preventDefault();
    if (draggingTaskId && draggingTaskId !== overId) {
      setHoverTaskId(overId);
    }
  };
  const handleTaskColumnDragOver = (columnId: string) => {
    if (isMobile) return;
    if (draggingTaskId) setTaskDropColumnId(columnId);
  };
  const handleTaskDrop = async (e: React.DragEvent<HTMLDivElement>, columnId: string) => {
    if (isMobile) return;
    e.preventDefault();
    if (!draggingTaskId) return;
    try {
      await updateTask({ id: draggingTaskId, columnId, updatedAt: new Date() });
    } catch (err) {
      console.error('Task move failed', err);
    } finally {
      setDraggingTaskId(null);
      setHoverTaskId(null);
      setTaskDropColumnId(null);
    }
  };

  // ── Column drag & drop ──────────────────────────────────────────────────
  const handleColumnDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    if (isMobile) return;
    e.dataTransfer.effectAllowed = 'move';
    setDraggingColumnId(id);
    setHoverColumnId(null);
  };

  const handleColumnDragOver = (e: React.DragEvent<HTMLDivElement>, overId: string) => {
    if (isMobile) return;
    e.preventDefault();
    if (!draggingColumnId || draggingColumnId === overId) return;
    setHoverColumnId(overId);
  };

  const handleColumnDragEnd = () => {
    if (isMobile) return;
    if (draggingColumnId) {
      // sort visible columns by position
      const sorted = columnsToRender.slice().sort((a, b) => a.position - b.position);

      const fromIdx = sorted.findIndex(c => c.id === draggingColumnId);
      const toIdx = hoverColumnId ? sorted.findIndex(c => c.id === hoverColumnId) : fromIdx;

      if (fromIdx >= 0 && toIdx >= 0 && fromIdx !== toIdx) {
        // reorder array
        const moved = sorted.splice(fromIdx, 1)[0];
        sorted.splice(toIdx, 0, moved);
        // batch update new positions
        sorted.forEach((col, i) => {
          updateColumn({ id: col.id, position: i + 1, updatedAt: new Date() });
        });
      }
    }

    setDraggingColumnId(null);
    setHoverColumnId(null);
  };

  const renderColumn = (column: Column) => {
    const colTasks = tasks.filter(t => t.columnId === column.id);
    const onHideColumn = () => toggleHiddenColumn(column.id);
    return (
      <TodoColumn
        key={column.id}
        column={column}
        tasks={colTasks}
        isMobile={isMobile}
        showDate={showDate}
        onEditColumn={openEditColumnModal}
        onAddColumnAfter={openInsertColumnModal}
        onAddTask={handleAddTask}
        onEditTask={handleEditTask}
        onRenameTask={handleRenameTask}
        onToggleDone={handleToggleDone}
        onDragStart={handleTaskDragStart}
        onDragOverTask={handleTaskDragOver}
        onTaskColumnDragOver={handleTaskColumnDragOver}
        onDrop={handleTaskDrop}
        draggingTaskId={draggingTaskId}
        hoverTaskId={hoverTaskId}
        taskDropColumnId={taskDropColumnId}
        // ── new column DnD props ───────────────────────────────────────
        onColumnDragStart={handleColumnDragStart}
        onColumnDragOver={handleColumnDragOver}
        onColumnDragEnd={handleColumnDragEnd}
        draggingColumnId={draggingColumnId}
        showAddTaskInput={!isMobile}
        syncStatus={syncStatus}
        onHideColumn={onHideColumn}
      />
    );
  };

  return (
    <Stack spacing={2}>
      <Stack
        direction={isMobile ? 'column-reverse' : 'row'}
        spacing={2}
        sx={{ userSelect: 'none', alignItems: 'flex-start' }}
      >
        {columnsToRender
          .slice()
          .sort((a, b) => a.position - b.position)
          .map(renderColumn)}
      </Stack>

      {boardIsEmpty && (
        <Button variant="contained" onClick={openNewColumnModal}>
          Add First Column
        </Button>
      )}

      <ColumnModal
        open={isColumnModalOpen}
        column={activeColumn}
        onSave={handleSaveColumn}
        onDelete={id => id && handleDeleteColumn(id)}
        onClose={closeColumnModal}
      />

      {isMobile && <AddTaskFloatButton />}

      <TaskModal
        open={Boolean(editingTask)}
        task={editingTask}
        onClose={() => setEditingTask(null)}
      />
    </Stack>
  );
}
