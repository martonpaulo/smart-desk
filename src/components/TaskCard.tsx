import { DragEvent, ReactNode, useEffect, useRef, useState } from 'react';

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CheckIcon from '@mui/icons-material/Check';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import EditIcon from '@mui/icons-material/Edit';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import UndoIcon from '@mui/icons-material/Undo';
import { Box, IconButton, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { alpha, darken } from '@mui/material/styles';

import { SyncedSyncIcon } from '@/components/SyncedSyncIcon';
import { useBoardStore } from '@/store/board/store';
import { SyncStatus } from '@/store/syncStatus';
import { theme } from '@/styles/theme';
import { Task } from '@/types/task';
import { isTaskEmpty } from '@/utils/boardHelpers';
import { defaultColumns } from '@/widgets/TodoList/defaultColumns';
import { EditTaskModal } from '@/widgets/TodoList/EditTaskModal';

interface TaskCardProps {
  task: Task;
  color: string;
  onRename: (id: string, title: string) => void;

  startEditing?: boolean;
  onEditingEnd?: () => void;
  syncStatus: SyncStatus;

  onDragStart?: (event: DragEvent<HTMLDivElement>, id: string) => void;
  onDragOver?: (event: DragEvent<HTMLDivElement>, id: string) => void;
}

export function TaskCard({
  task,
  color,
  onRename,
  onDragStart,
  onDragOver,
  startEditing = false,
  onEditingEnd,
  syncStatus,
}: TaskCardProps) {
  const columns = useBoardStore(s => s.columns);
  const addColumn = useBoardStore(s => s.addColumn);
  const updateColumn = useBoardStore(s => s.updateColumn);
  const updateTask = useBoardStore(s => s.updateTask);

  const [editing, setEditing] = useState(Boolean(startEditing));
  const [title, setTitle] = useState(task.title);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const [openEditModal, setOpenEditModal] = useState(false);

  const handleDeleteTask = async (id: string) => {
    try {
      await updateTask({ id, trashed: true, updatedAt: new Date() });
    } catch (err) {
      console.error('Task delete failed', err);
    }
  };

  const handleSaveTask = (updated: Task) => {
    if (isTaskEmpty(updated)) return;
    updateTask({ ...updated });
  };

  const handleToggleDone = async (id: string) => {
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
      }

      const columnId = await addColumn({
        title: defaultColumns.todo.title,
        color: defaultColumns.todo.color,
        updatedAt: now,
      });
      taskColumnId = columnId;
    }

    // just update done count
    await updateTask({ id, columnId: taskColumnId, quantityDone: value, updatedAt: now });
    return;
  };

  useEffect(() => {
    if (startEditing) {
      setEditing(true);
      setTitle(task.title);
    }
  }, [startEditing, task.title]);

  useEffect(() => {
    if (editing && titleInputRef.current) {
      const input = titleInputRef.current;
      input.focus();
      const len = input.value.length;
      input.setSelectionRange(len, len);
    }
  }, [editing]);

  const finishEditing = () => {
    const trimmed = title.trim();
    if (trimmed) onRename(task.id, trimmed);
    setEditing(false);
    onEditingEnd?.();
  };

  const isQuantityTask = task.quantityTarget > 1;
  const isTaskDone = task.quantityDone === task.quantityTarget;

  const primaryAction = <EditIcon fontSize="inherit" />;
  const primaryActionLabel = 'Rename task';

  let secondaryAction: ReactNode = null;
  let secondaryActionLabel: string = '';

  if (isTaskDone) {
    secondaryAction = <UndoIcon fontSize="inherit" />;
    secondaryActionLabel = 'Uncheck task';
  } else if (isQuantityTask) {
    secondaryAction = <AddCircleOutlineIcon fontSize="inherit" />;
    secondaryActionLabel = 'Increment task';
  } else {
    secondaryAction = <CheckIcon fontSize="inherit" />;
    secondaryActionLabel = 'Check task';
  }

  return (
    <>
      <Box
        data-todo-id={task.id}
        role="button"
        aria-label={`Open task ${task.title}`}
        draggable
        onDragStart={e => {
          e.stopPropagation();
          if (onDragStart) onDragStart(e, task.id);
        }}
        onDragOver={e => {
          e.preventDefault();
          if (onDragOver) onDragOver(e, task.id);
        }}
        onClick={() => !editing && setOpenEditModal(true)}
        sx={{
          p: 1.5,
          borderRadius: 1,
          mb: 1,
          position: 'relative',
          bgcolor: alpha(darken(color, 0.2), 0.15),
          cursor: editing ? 'text' : 'pointer',
          touchAction: 'none',
          '&:hover .todo-actions': { visibility: 'visible' },
          '&:active': { cursor: 'grabbing' },
          boxShadow: `0 1px 3px ${alpha(darken(color, 0.1), 0.1)}`,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={0.5}>
          <Stack direction="row" spacing={0.5} fontSize="0.8rem" alignItems="center">
            {!task.isSynced && !editing && <SyncedSyncIcon status={syncStatus} />}

            {task.important && task.urgent && (
              <Tooltip title="Important and urgent task">
                <LocalFireDepartmentIcon fontSize="small" color="error" />
              </Tooltip>
            )}

            {task.notes && (
              <Tooltip title="Has notes">
                <DescriptionOutlinedIcon fontSize="inherit" color="action" />
              </Tooltip>
            )}

            {task.daily && (
              <Tooltip title="Repeat daily">
                <EventRepeatIcon fontSize="inherit" color="action" />
              </Tooltip>
            )}
          </Stack>

          <Stack direction="row" spacing={1} flex={1}>
            {editing ? (
              <TextField
                fullWidth
                multiline
                size="small"
                value={title}
                autoFocus
                inputRef={titleInputRef}
                variant="standard"
                onBlur={finishEditing}
                onChange={e => setTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.stopPropagation();
                    finishEditing();
                  }
                }}
                slotProps={{
                  input: {
                    sx: theme => ({
                      font: theme.typography.body2.fontFamily,
                      fontSize: theme.typography.body2.fontSize,
                      lineHeight: theme.typography.body2.lineHeight,
                      fontWeight: theme.typography.body2.fontWeight,
                    }),
                  },
                }}
              />
            ) : (
              <Stack direction="row" alignItems="center" gap={0.5}>
                <Typography
                  role="button"
                  aria-label={`View details of ${task.title}`}
                  onClick={() => setOpenEditModal(true)}
                  variant="body2"
                  sx={{
                    userSelect: 'none',
                    maxWidth: '100%',
                    overflowWrap: 'anywhere',
                    whiteSpace: 'normal',
                    textDecoration: isTaskDone ? 'line-through' : 'none',
                  }}
                >
                  {task.title}
                </Typography>

                {isQuantityTask && (
                  <Typography variant="caption">
                    ({`${task.quantityDone}/${task.quantityTarget}`})
                  </Typography>
                )}
              </Stack>
            )}
          </Stack>

          {!editing && (
            <Box
              className="todo-actions"
              sx={{
                position: 'absolute',
                top: 8,
                borderRadius: 1,
                right: 6,
                zIndex: 2,
                display: 'flex',
                visibility: 'hidden',
                '& button': { cursor: 'pointer', p: 0.5 },
              }}
            >
              <Box sx={{ backgroundColor: theme.palette.grey[100], borderRadius: 1, opacity: 0.9 }}>
                <Tooltip title={primaryActionLabel}>
                  <IconButton
                    size="small"
                    aria-label={`Rename task ${task.title}`}
                    onClick={e => {
                      e.stopPropagation();
                      setTitle(task.title);
                      setEditing(true);
                    }}
                    sx={{
                      borderTopLeftRadius: 1,
                      borderBottomLeftRadius: 1,
                      borderTopRightRadius: 0,
                      borderBottomRightRadius: 0,
                    }}
                  >
                    {primaryAction}
                  </IconButton>
                </Tooltip>
                <Tooltip title={secondaryActionLabel}>
                  <IconButton
                    size="small"
                    aria-label={`Toggle task ${task.title}`}
                    onClick={e => {
                      e.stopPropagation();
                      handleToggleDone(task.id);
                    }}
                    sx={{
                      borderTopLeftRadius: 0,
                      borderBottomLeftRadius: 0,
                      borderTopRightRadius: 1,
                      borderBottomRightRadius: 1,
                    }}
                  >
                    {secondaryAction}
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          )}
        </Stack>
      </Box>

      <EditTaskModal
        open={openEditModal}
        task={task}
        onSave={handleSaveTask}
        onClose={() => setOpenEditModal(false)}
        onDeleteTask={handleDeleteTask}
      />
    </>
  );
}
