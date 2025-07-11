import { useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import { alpha, Box, Chip, darken, IconButton, Stack, Typography } from '@mui/material';

import { AddTaskInput } from '@/widgets/TodoList/AddTaskInput';
import { TodoTaskCard } from '@/widgets/TodoList/TodoTaskCard';
import { Column, TodoTask } from '@/widgets/TodoList/types';

interface TodoColumnProps {
  column: Column;
  tasks: TodoTask[];
  view: 'list' | 'board';
  onOpenColumn: (column: Column) => void;
  onAddColumn: (afterId: string) => void;
  onEditTask: (id: string) => void;
  onRenameTask: (id: string, title: string) => void;
  onDeleteTask: (id: string) => void;
  onToggleDone: (id: string) => void;
  onAddTask: (columnSlug: string, title: string) => string;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onDragOverTask: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onTaskColumnDragOver: (columnSlug: string) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, columnSlug: string) => void;
  onColumnDragStart?: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onColumnDragOver?: (e: React.DragEvent<HTMLDivElement>, overId: string) => void;
  onColumnDragEnd?: () => void;
  draggingTaskId?: string | null;
  hoverTaskId?: string | null;
  taskDropColumnId?: string | null;
  draggingColumnId?: string | null;
  hideHeader?: boolean;
  showAddTaskInput?: boolean;
}

export function TodoColumn({
  column,
  tasks,
  view,
  onOpenColumn,
  onAddColumn,
  onEditTask,
  onRenameTask,
  onDeleteTask,
  onToggleDone,
  onAddTask,
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
  hideHeader,
  showAddTaskInput = true,
}: TodoColumnProps) {
  const [creatingId, setCreatingId] = useState<string | null>(null);

  const handleAddTask = (colId: string, title: string) => {
    const id = onAddTask(colId, title);
    setCreatingId(id);
    return id;
  };

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
        width: view === 'board' ? '220px' : '100%',
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
      {!hideHeader && (
        <Box onClick={() => onOpenColumn(column)} sx={{ cursor: 'pointer', mb: 1 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h3" sx={{ color: column.color }}>
              {column.title}
            </Typography>
            {tasks && tasks.length > 0 && (
              <Chip
                label={tasks?.length}
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
      )}

      {tasks &&
        tasks.map(task => (
          <div key={task.id}>
            {draggingTaskId && hoverTaskId === task.id && (
              <Box height={4} bgcolor={column.color} mb={0.5} borderRadius={2} />
            )}
            <TodoTaskCard
              task={task}
              column={column}
              onOpen={onEditTask}
              onRename={onRenameTask}
              onDelete={onDeleteTask}
              onToggleDone={onToggleDone}
              onDragStart={onDragStart}
              onDragOver={onDragOverTask}
              startEditing={creatingId === task.id}
              onEditingEnd={finishCreate}
            />
          </div>
        ))}

      {draggingTaskId && !hoverTaskId && taskDropColumnId === column.id && (
        <Box height={4} bgcolor={column.color} mb={0.5} borderRadius={2} />
      )}

      {!creatingId && showAddTaskInput && column.id && (
        <AddTaskInput
          columnSlug={column.id}
          columnColor={alpha(darken(column.color, 0.2), 0.15)}
          onAdd={handleAddTask}
        />
      )}

      <IconButton
        size="small"
        className="add-column-btn"
        onClick={() => column.id && onAddColumn(column.id)}
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
