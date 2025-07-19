import { useEffect, useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { alpha, Box, Chip, darken, IconButton, Stack, Typography } from '@mui/material';

import { SyncedSyncIcon } from '@/components/SyncedSyncIcon';
import { TaskCard } from '@/components/TaskCard';
import { SyncStatus } from '@/store/syncStatus';
import { Column } from '@/types/column';
import { Task } from '@/types/task';
import { AddTaskInput } from '@/widgets/TodoList/AddTaskInput';

interface TodoColumnProps {
  column: Column;
  tasks: Task[];
  isMobile?: boolean;
  onEditColumn: (column: Column) => void;
  onAddColumnAfter: (prevPos: number) => void;
  onAddTask: (task: Partial<Task>) => Promise<string>;
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
  onHideColumn?: () => void;
}

export function TodoColumn({
  column,
  tasks,
  isMobile = false,
  onEditColumn,
  onAddColumnAfter,
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
  onHideColumn,
}: TodoColumnProps) {
  const [creatingId, setCreatingId] = useState<string | null>(null);
  const [hideColumn, setHideColumn] = useState(false);

  useEffect(() => {
    console.log(creatingId);
  }, [creatingId]);

  const orderedTasks = tasks.sort((a, b) => a.position - b.position);

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
      <Box sx={{ cursor: 'pointer', mb: 1 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            userSelect: 'none',
            mb: 1,
            cursor: 'pointer',
            '&:hover .column-hide-btn': { visibility: 'visible' },
          }}
        >
          <Stack direction="row" gap={0.5} alignItems="center">
            {!column.isSynced && (
              <SyncedSyncIcon status={syncStatus} fontSize="inherit" color="action" />
            )}

            <Typography
              variant="h3"
              sx={{ color: column.color }}
              onClick={() => onEditColumn(column)}
            >
              {column.title}
            </Typography>

            <IconButton
              size="small"
              className="column-hide-btn"
              onClick={() => {
                if (onHideColumn) {
                  onHideColumn();
                } else {
                  setHideColumn(!hideColumn);
                }
              }}
              sx={{
                opacity: hideColumn ? 0.5 : 0.8,
                color: hideColumn ? 'text.secondary' : column.color,
                visibility: hideColumn ? 'visible' : 'hidden',
              }}
            >
              {hideColumn ? (
                <VisibilityOffIcon fontSize="small" sx={{ fontSize: '1rem' }} />
              ) : (
                <VisibilityIcon fontSize="small" sx={{ fontSize: '1rem' }} />
              )}
            </IconButton>
          </Stack>

          <Chip
            label={orderedTasks?.length}
            size="small"
            disabled
            sx={{
              '&.Mui-disabled': {
                opacity: 1,
                backgroundColor: alpha(column.color, 0.1),
                fontWeight: '400',
              },
            }}
          />
        </Stack>
      </Box>

      <Stack gap={1}>
        {!hideColumn &&
          orderedTasks &&
          orderedTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              color={column.color}
              editTask={creatingId === task.id}
              onFinishEditing={() => setCreatingId(null)}
              onTaskDragOver={onDragOverTask}
              onTaskDragStart={onDragStart}
            />
          ))}

        {!creatingId && showAddTaskInput && column.id && !hideColumn && (
          <AddTaskInput
            columnId={column.id}
            columnColor={alpha(darken(column.color, 0.2), 0.15)}
            onFinishAdding={id => setCreatingId(id)}
            variant="outlined"
          />
        )}
      </Stack>

      {draggingTaskId && !hoverTaskId && taskDropColumnId === column.id && (
        <Box height={4} bgcolor={column.color} mb={0.5} borderRadius={2} />
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
