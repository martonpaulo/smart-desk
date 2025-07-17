import { useState } from 'react';

import { Button, Stack } from '@mui/material';

import { useResponsiveness } from '@/hooks/useResponsiveness';
import { useBoardStore } from '@/store/board/store';
import { useSyncStatusStore } from '@/store/syncStatus';
import { useTodoPrefsStore } from '@/store/todoPrefsStore';
import { Column } from '@/types/column';
import { Task } from '@/types/task';
import { getNewColumnPosition, isTaskEmpty } from '@/utils/boardHelpers';
import { AddTaskFloatButton } from '@/widgets/TodoList/AddTaskFloatButton';
import { ColumnModal } from '@/widgets/TodoList/ColumnModal';
import { EditTaskModal } from '@/widgets/TodoList/EditTaskModal';
import { TodoColumn } from '@/widgets/TodoList/TodoColumn';

// Safari PWA drag-drop fix
import '@/lib/dragDropTouch';

export function TodoList() {
  const syncStatus = useSyncStatusStore(s => s.status);

  // store selectors
  const columns = useBoardStore(s => s.columns);
  const tasks = useBoardStore(s => s.tasks);
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
  const setHideDoneColumn = useTodoPrefsStore(state => state.setHideDoneColumn);

  const columnsToRender = columns.filter(c => {
    if (c.trashed) return false;
    if (hideDoneColumn && c.title === 'Done') return false;
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
  const handleAddTask = async (title: string, columnId?: string): Promise<string> => {
    try {
      return await addTask({ title, columnId, updatedAt: new Date() });
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

  const handleSaveTask = (updated: Task) => {
    if (isTaskEmpty(updated)) return;
    try {
      updateTask({ ...updated });
    } catch (err) {
      console.error('Task save failed', err);
    } finally {
      setEditingTask(null);
    }
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

  const handleDeleteTask = async (id: string) => {
    try {
      await updateTask({ id, trashed: true, updatedAt: new Date() });
    } catch (err) {
      console.error('Task delete failed', err);
    }
  };

  const handleToggleDone = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const now = new Date();

    const next = (task.quantityDone ?? 0) + 1;
    const value = next > task.quantityTarget ? 0 : next;

    if (value === task.quantityTarget) {
      const doneColumn = columns.find(c => c.title === 'Done');
      if (doneColumn) {
        await updateTask({ id, columnId: doneColumn.id, quantityDone: value, updatedAt: now });
      } else {
        const columnId = await addColumn({
          title: 'Done',
          color: '#4caf50',
          position: columnsToRender.length + 1,
          updatedAt: now,
        });
        await updateTask({
          id,
          columnId: columnId ? columnId : task.columnId,
          quantityDone: value,
          updatedAt: now,
        });
        return;
      }
    }

    if (value === 0) {
      const todoColumn = columns.find(c => c.title === 'To Do');
      if (todoColumn) {
        await updateTask({ id, columnId: todoColumn.id, quantityDone: value, updatedAt: now });
      } else {
        const columnId = await addColumn({
          title: 'To Do',
          color: '#2196f3',
          position: columnsToRender.length + 1,
          updatedAt: now,
        });
        await updateTask({
          id,
          columnId: columnId ? columnId : task.columnId,
          quantityDone: value,
          updatedAt: now,
        });
        return;
      }

      // just update done count
      await updateTask({ id, quantityDone: value, updatedAt: now });
      return;
    }
  };

  // ── Task drag & drop ────────────────────────────────────────────────────
  const handleTaskDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.dataTransfer.effectAllowed = 'move';
    setDraggingTaskId(id);
    setHoverTaskId(null);
    setTaskDropColumnId(null);
  };
  const handleTaskDragOver = (e: React.DragEvent<HTMLDivElement>, overId: string) => {
    e.preventDefault();
    if (draggingTaskId && draggingTaskId !== overId) {
      setHoverTaskId(overId);
    }
  };
  const handleTaskColumnDragOver = (columnId: string) => {
    if (draggingTaskId) setTaskDropColumnId(columnId);
  };
  const handleTaskDrop = async (e: React.DragEvent<HTMLDivElement>, columnId: string) => {
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
    e.dataTransfer.effectAllowed = 'move';
    setDraggingColumnId(id);
    setHoverColumnId(null);
  };

  const handleColumnDragOver = (e: React.DragEvent<HTMLDivElement>, overId: string) => {
    e.preventDefault();
    if (!draggingColumnId || draggingColumnId === overId) return;
    setHoverColumnId(overId);
  };

  const handleColumnDragEnd = () => {
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
    const colTasks = tasks.filter(t => t.columnId === column.id && !t.trashed);
    const onHideColumn =
      column.title === 'Done'
        ? () => setHideDoneColumn(true)
        : undefined;
    return (
      <TodoColumn
        key={column.id}
        column={column}
        tasks={colTasks}
        isMobile={isMobile}
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

      {isMobile && <AddTaskFloatButton onAdd={handleAddTask} />}

      <EditTaskModal
        column={editingTask ? columns.find(c => c.id === editingTask.columnId) || null : null}
        open={Boolean(editingTask)}
        task={editingTask}
        onSave={handleSaveTask}
        onClose={() => setEditingTask(null)}
        onDeleteTask={handleDeleteTask}
      />
    </Stack>
  );
}
