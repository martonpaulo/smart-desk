import { useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import { alpha, Box, Chip, darken, IconButton, Stack, Typography } from '@mui/material';

import { SyncedSyncIcon } from '@/components/SyncedSyncIcon';
import { SyncStatus } from '@/store/syncStatus';
import { Column } from '@/types/column';
import { Task } from '@/types/task';
import { AddTaskInput } from '@/widgets/TodoList/AddTaskInput';
import { TodoTaskCard } from '@/widgets/TodoList/TodoTaskCard';

interface TodoColumnProps {
  column: Column;
  tasks: Task[];
  isMobile?: boolean;
  onEditColumn: (column: Column) => void;
  onAddColumnAfter: (prevPos: number) => void;
  onAddTask: (title: string, columnId: string) => Promise<string>;
  onEditTask: (id: string) => void;
  onRenameTask: (id: string, title: string) => void;
  onToggleDone: (id: string) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onDragOverTask: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onTaskColumnDragOver: (columnId: string) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, columnId: string) => void;
  onColumnDragStart?: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onColumnDragOver?: (e: React.DragEvent<HTMLDivElement>, overId: string) => void;
  onColumnDragEnd?: () => void;
  draggingTaskId?: string | null;
  hoverTaskId?: string | null;
  taskDropColumnId?: string | null;
  draggingColumnId?: string | null;
  showAddTaskInput?: boolean;
  syncStatus: SyncStatus;
}

export function TodoColumn({
  column,
  tasks,
  isMobile = false,
  onEditColumn,
  onAddColumnAfter,
  onAddTask,
  onEditTask,
  onRenameTask,
  onToggleDone,
  onDragStart,
  onDragOverTask,
  onTaskColumnDragOver,
  onDrop,
  onColumnDragStart,
  onColumnDragOver,
  onColumnDragEnd,
  draggingTaskId,
  hoverTaskId,
  taskDropColumnId,
  draggingColumnId,
  showAddTaskInput = true,
  syncStatus,
}: TodoColumnProps) {
  const [creatingId, setCreatingId] = useState<string | null>(null);

  const handleAddTask = async (colId: string, title: string) => {
    const id = await onAddTask(title, colId);
    setCreatingId(id);
    return id;
  };

  const orderedTasks = tasks.sort((a, b) => a.position - b.position);

  const finishCreate = () => setCreatingId(null);

  return (
    <Box
      className="todo-column"
      draggable
      onDragStart={e => onColumnDragStart && column.id && onColumnDragStart(e, column.id)}
      onDragOver={e => {
        e.preventDefault();
        if (draggingColumnId && column.id) {
          onColumnDragOver?.(e, column.id);
        }
        if (draggingTaskId && column.id) {
          onTaskColumnDragOver(column.id);
        }
      }}
      onDragEnd={onColumnDragEnd}
      onDrop={e => column.id && onDrop(e, column.id)}
      sx={{
        width: isMobile ? '100%' : '220px',
        p: 1.5,
        bgcolor: alpha(column.color, 0.1),
        borderRadius: 1,
        boxShadow: `0 1px 3px ${alpha(darken(column.color, 0.1), 0.1)}`,
        position: 'relative',
        touchAction: 'none',
        '&:hover .add-column-btn': {
          visibility: 'visible',
        },
      }}
    >
      <Box onClick={() => onEditColumn(column)} sx={{ cursor: 'pointer', mb: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" gap={0.5}>
            {!column.isSynced && <SyncedSyncIcon status={syncStatus} />}

            <Typography variant="h3" sx={{ color: column.color }}>
              {column.title}
            </Typography>
          </Stack>

          {orderedTasks && orderedTasks.length > 0 && (
            <Chip
              label={orderedTasks?.length}
              size="small"
              disabled
              sx={{
                '&.Mui-disabled': {
                  opacity: 1,
                },
              }}
            />
          )}
        </Stack>
      </Box>

      {orderedTasks &&
        orderedTasks.map(task => (
          <div key={task.id}>
            {draggingTaskId && hoverTaskId === task.id && (
              <Box height={4} bgcolor={column.color} mb={0.5} borderRadius={2} />
            )}
            <TodoTaskCard
              task={task}
              column={column}
              onOpen={onEditTask}
              onRename={onRenameTask}
              onToggleDone={onToggleDone}
              onDragStart={onDragStart}
              onDragOver={onDragOverTask}
              startEditing={creatingId === task.id}
              onEditingEnd={finishCreate}
              syncStatus={syncStatus}
            />
          </div>
        ))}

      {draggingTaskId && !hoverTaskId && taskDropColumnId === column.id && (
        <Box height={4} bgcolor={column.color} mb={0.5} borderRadius={2} />
      )}

      {!creatingId && showAddTaskInput && column.id && (
        <AddTaskInput
          columnId={column.id}
          columnColor={alpha(darken(column.color, 0.2), 0.15)}
          onAdd={handleAddTask}
        />
      )}

      <IconButton
        size="small"
        className="add-column-btn"
        onClick={() => onAddColumnAfter(column.position)}
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          transform: 'translate(50%, -50%)',
          visibility: 'hidden',
          backgroundColor: theme => alpha(theme.palette.grey[500], 0.15), // neutral gray with opacity
          '&:hover': {
            backgroundColor: theme => alpha(theme.palette.grey[500], 0.25),
          },
        }}
      >
        <AddIcon fontSize="inherit" />
      </IconButton>

      <style jsx>{`
        .todo-column:hover .add-column-btn {
          visibility: visible;
        }
      `}</style>
    </Box>
  );
}
