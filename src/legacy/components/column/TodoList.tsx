// Safari PWA drag-drop fix
import 'src/legacy/lib/dragDropTouch';

import { Button, Stack } from '@mui/material';
import { useState } from 'react';

import { ColumnModal } from 'src/legacy/components/column/ColumnModal';
import { TodoColumn } from 'src/legacy/components/column/TodoColumn';
import { AddTaskFloatButton } from 'src/legacy/components/task/AddTaskFloatButton';
import { SyncStatus } from 'src/legacy/components/task/SyncedSyncIcon';
import { TaskCard } from 'src/legacy/components/task/TaskCard';
import { TaskModal } from 'src/legacy/components/task/TaskModal';
import { useTasks } from 'src/legacy/hooks/useTasks';
import { useBoardStore } from 'src/legacy/store/board/store';
import { SyncStatus as SyncStatusFromStore, useSyncStatusStore } from 'src/legacy/store/syncStatus';
import { useTodoPrefsStore } from 'src/legacy/store/todoPrefsStore';
import { Column } from 'src/legacy/types/column';
import { Task } from 'src/legacy/types/task';
import { getNewColumnPosition } from 'src/legacy/utils/boardHelpers';
import { useResponsiveness } from 'src/shared/hooks/useResponsiveness';

interface TodoListProps {
  showDate?: boolean;
}

const mapSyncStatusFromStore = (status: SyncStatusFromStore): SyncStatus => {
  switch (status) {
    case 'disconnected':
      return 'disconnected';
    case 'error':
      return 'error';
    default:
      return 'syncing';
  }
};

export function TodoList({ showDate }: TodoListProps) {
  const syncStatusFromStore = useSyncStatusStore(s => s.status);
  const syncStatus = mapSyncStatusFromStore(syncStatusFromStore);

  const tasks = useTasks({ plannedDate: new Date(), trashed: false, classified: true });

  const mobileTasks = useTasks({
    plannedDate: new Date(),
    trashed: false,
    classified: true,
    done: false,
  });

  // store selectors
  const columns = useBoardStore(s => s.columns);
  const addColumn = useBoardStore(s => s.addColumn);
  const addTask = useBoardStore(s => s.addTask);
  const updateColumn = useBoardStore(s => s.updateColumn);
  const updateTask = useBoardStore(s => s.updateTask);

  const isMobile = useResponsiveness();

  // column modal state
  const [isColumnModalOpen, setColumnModalOpen] = useState(false);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [insertionPosition, setInsertionPosition] = useState<number>();
  // task drag state
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [hoverTaskId, setHoverTaskId] = useState<string | null>(null);
  const [taskDropColumnId, setTaskDropColumnId] = useState<string | null>(null);
  // column drag state
  const [draggingColumnId, setDraggingColumnId] = useState<string | null>(null);
  const [hoverColumnId, setHoverColumnId] = useState<string | null>(null);

  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const hiddenColumnIds = useTodoPrefsStore(state => state.hiddenColumnIds);
  const toggleHiddenColumn = useTodoPrefsStore(state => state.toggleHiddenColumn);

  const activeColumns = columns.filter(c => !c.trashed);
  const visibleColumns = activeColumns.filter(c => !hiddenColumnIds.includes(c.id));

  const boardIsEmpty = visibleColumns.length === 0;

  const getColumnColor = (columnId: string) => {
    const col = activeColumns.find(c => c.id === columnId);
    return col?.color ?? '#999';
  };

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

  // ── Task handlers ──────────────────────────────────────────────────────
  const handleAddTask = async (task: Partial<Task>): Promise<string> => {
    try {
      return await addTask({
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

  // ── Task drag & drop (disabled on mobile) ───────────────────────────────
  const handleTaskDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    if (isMobile) return;
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

  // ── Column drag & drop (desktop only) ───────────────────────────────────
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
      const sorted = visibleColumns.slice().sort((a, b) => a.position - b.position);
      const fromIdx = sorted.findIndex(c => c.id === draggingColumnId);
      const toIdx = hoverColumnId ? sorted.findIndex(c => c.id === hoverColumnId) : fromIdx;

      if (fromIdx >= 0 && toIdx >= 0 && fromIdx !== toIdx) {
        const moved = sorted.splice(fromIdx, 1)[0];
        sorted.splice(toIdx, 0, moved);
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
        onDragStart={handleTaskDragStart}
        onDragOverTask={handleTaskDragOver}
        onTaskColumnDragOver={handleTaskColumnDragOver}
        onDrop={handleTaskDrop}
        draggingTaskId={draggingTaskId}
        hoverTaskId={hoverTaskId}
        taskDropColumnId={taskDropColumnId}
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
    <>
      {/* Mobile: show a single consolidated task list excluding "Done" column */}
      {isMobile ? (
        <Stack spacing={2} pt={2} sx={{ userSelect: 'none' }}>
          <Stack gap={1}>
            {mobileTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                color={getColumnColor(task.columnId)}
                hasDefaultWidth={false}
                showDate={showDate}
                editTask={false}
                onFinishEditing={() => undefined}
                onTaskDragOver={() => undefined}
                onTaskDragStart={() => undefined}
              />
            ))}
          </Stack>

          {boardIsEmpty && (
            <Button variant="contained" onClick={openNewColumnModal}>
              Add First Column
            </Button>
          )}

          <AddTaskFloatButton />
        </Stack>
      ) : (
        // Desktop: original columns layout
        <Stack direction="row" spacing={2} sx={{ userSelect: 'none', alignItems: 'flex-start' }}>
          {visibleColumns
            .slice()
            .sort((a, b) => a.position - b.position)
            .map(renderColumn)}
        </Stack>
      )}

      <ColumnModal
        open={isColumnModalOpen}
        column={activeColumn}
        onSave={handleSaveColumn}
        onDelete={id => id && handleDeleteColumn(id)}
        onClose={closeColumnModal}
      />

      <TaskModal
        open={Boolean(editingTask)}
        task={editingTask}
        onCloseAction={() => setEditingTask(null)}
      />
    </>
  );
}
