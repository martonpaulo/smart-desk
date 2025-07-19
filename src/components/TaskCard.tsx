import { DragEvent, useCallback, useEffect, useRef, useState } from 'react';

import {
  AddCircleOutline as AddIcon,
  Check as CheckIcon,
  DescriptionOutlined as NotesIcon,
  Edit as EditIcon,
  LocalFireDepartment as FireIcon,
  NotificationsActive as AlertIcon,
  Security as ShieldIcon,
  Undo as UndoIcon,
} from '@mui/icons-material';
import { BoxProps, Tooltip } from '@mui/material';

import { SyncedSyncIcon } from '@/components/SyncedSyncIcon';
import * as S from '@/components/TaskCard.styles';
import { useBoardStore } from '@/store/board/store';
import { useSyncStatusStore } from '@/store/syncStatus';
import type { Task } from '@/types/task';
import { isTaskEmpty } from '@/utils/boardHelpers';
import { defaultColumns } from '@/widgets/TodoList/defaultColumns';
import { EditTaskModal } from '@/widgets/TodoList/EditTaskModal';

interface TaskCardProps extends BoxProps {
  task: Task;
  color: string;
  editTask?: boolean;
  onFinishEditing?: () => void;
  onTaskDragStart?: (e: DragEvent<HTMLDivElement>, id: string) => void;
  onTaskDragOver?: (e: DragEvent<HTMLDivElement>, id: string) => void;
}

export function TaskCard({
  task,
  color,
  editTask = false,
  onFinishEditing,
  onTaskDragStart,
  onTaskDragOver,
  ...props
}: TaskCardProps) {
  // board actions
  const columns = useBoardStore(s => s.columns);
  const addColumn = useBoardStore(s => s.addColumn);
  const updateColumn = useBoardStore(s => s.updateColumn);
  const updateTask = useBoardStore(s => s.updateTask);
  const syncStatus = useSyncStatusStore(s => s.status);

  // local state
  const [isEditing, setIsEditing] = useState(editTask);
  const [title, setTitle] = useState(task.title);
  const [initial, setInitial] = useState(task);
  const [isModalOpen, setModalOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsEditing(editTask);
  }, [editTask]);

  // focus input when editing
  useEffect(() => {
    if (isEditing && inputRef.current) {
      const inp = inputRef.current;
      inp.focus();
      inp.setSelectionRange(inp.value.length, inp.value.length);
    }
  }, [isEditing]);

  // drag handlers
  const handleDragStart = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.stopPropagation();
      onTaskDragStart?.(e, task.id);
    },
    [onTaskDragStart, task.id],
  );

  const handleDragOver = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      onTaskDragOver?.(e, task.id);
    },
    [onTaskDragOver, task.id],
  );

  // save any edits
  const saveTask = useCallback(
    (updated: Task) => {
      if (isTaskEmpty(updated)) return;

      const changed =
        updated.title !== initial.title ||
        updated.notes !== initial.notes ||
        updated.important !== initial.important ||
        updated.urgent !== initial.urgent ||
        updated.daily !== initial.daily ||
        updated.quantityDone !== initial.quantityDone ||
        updated.quantityTarget !== initial.quantityTarget ||
        updated.columnId !== initial.columnId;
      if (!changed) return;

      const now = new Date();

      updateTask({ ...updated, updatedAt: now });
      setInitial({ ...updated, updatedAt: now });
    },
    [initial, updateTask],
  );

  // finish inline title edit
  const finishInlineEdit = useCallback(() => {
    setIsEditing(false);
    if (onFinishEditing) onFinishEditing();
    saveTask({ ...task, title });
  }, [onFinishEditing, saveTask, task, title]);

  // toggle done / undo / increment logic
  const handleToggleDone = useCallback(async () => {
    const now = new Date();
    const { quantityTarget } = task;
    let { quantityDone, columnId } = task;
    const next = quantityDone + 1;
    quantityDone = next > quantityTarget ? 0 : next;

    // move to Done column when hitting target
    if (quantityDone === quantityTarget) {
      const done = columns.find(c => c.title === defaultColumns.done.title);
      if (done) {
        columnId = done.id;
        if (done.trashed) await updateColumn({ id: done.id, trashed: false, updatedAt: now });
      } else {
        columnId = await addColumn({
          title: defaultColumns.done.title,
          color: defaultColumns.done.color,
          updatedAt: now,
        });
      }
    }

    // move back to Todo when resetting
    if (quantityDone === 0) {
      const todo = columns.find(c => c.title === defaultColumns.todo.title);
      if (todo) {
        columnId = todo.id;
        if (todo.trashed) await updateColumn({ id: todo.id, trashed: false, updatedAt: now });
      } else {
        columnId = await addColumn({
          title: defaultColumns.todo.title,
          color: defaultColumns.todo.color,
          updatedAt: now,
        });
      }
    }

    await updateTask({ id: task.id, quantityDone, columnId, updatedAt: now });
    setInitial(prev => ({ ...prev, quantityDone, columnId, updatedAt: now }));
  }, [addColumn, columns, task, updateColumn, updateTask]);

  // delete via modal
  const handleDelete = useCallback(
    async (id: string) => {
      try {
        const now = new Date();
        await updateTask({ id, trashed: true, updatedAt: now });
        setInitial(prev => ({ ...prev, trashed: true, updatedAt: now }));
        setModalOpen(false);
      } catch (err) {
        console.error('Failed to delete task', err);
      }
    },
    [updateTask],
  );

  // determine icons
  const done = task.quantityDone === task.quantityTarget;
  const isCountTask = task.quantityTarget > 1;
  let SecondaryActionIcon = CheckIcon;
  let secondaryActionTooltip = 'Check task';
  if (done) {
    SecondaryActionIcon = UndoIcon;
    secondaryActionTooltip = 'Uncheck task';
  } else if (isCountTask) {
    SecondaryActionIcon = AddIcon;
    secondaryActionTooltip = 'Increment task';
  }

  const shouldShowIcons =
    !isEditing && (!task.isSynced || task.important || task.urgent || task.notes);

  return (
    <>
      <S.Container
        color={color}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        {...props}
      >
        {shouldShowIcons && (
          <S.Icons>
            {!task.isSynced && (
              <SyncedSyncIcon status={syncStatus} fontSize="inherit" color="action" />
            )}
            {task.important && task.urgent && (
              <Tooltip title="Important & urgent">
                <FireIcon fontSize="small" color="error" />
              </Tooltip>
            )}
            {task.important && !task.urgent && (
              <Tooltip title="Important & not urgent">
                <ShieldIcon fontSize="inherit" color="action" />
              </Tooltip>
            )}
            {task.urgent && !task.important && (
              <Tooltip title="Urgent & not important">
                <AlertIcon fontSize="inherit" color="warning" />
              </Tooltip>
            )}
            {task.notes && (
              <Tooltip title="Has notes">
                <NotesIcon fontSize="inherit" color="action" />
              </Tooltip>
            )}
          </S.Icons>
        )}

        <S.Content>
          {isEditing ? (
            <S.TitleInput
              value={title}
              inputRef={inputRef}
              variant="standard"
              onChange={e => setTitle(e.target.value)}
              onBlur={finishInlineEdit}
              onKeyDown={e =>
                (e.key === 'Enter' && finishInlineEdit()) ||
                (e.key === 'Escape' && setIsEditing(false) && onFinishEditing?.())
              }
            />
          ) : (
            <>
              <S.TitleText onClick={() => setModalOpen(true)} done={done} untitled={!task.title}>
                {task.title || 'Untitled Task'}

                {task.daily && (
                  <Tooltip title="Repeats daily">
                    <S.RepeatIndicator fontSize="inherit" />
                  </Tooltip>
                )}
              </S.TitleText>

              {isCountTask && (
                <S.QuantityText>
                  ({task.quantityDone}/{task.quantityTarget})
                </S.QuantityText>
              )}
            </>
          )}
        </S.Content>

        {!isEditing && (
          <S.ActionGroup className="action-group">
            <S.ActionWrapper>
              <Tooltip title="Edit task">
                <S.ActionIcon
                  onClick={() => {
                    setTitle(task.title);
                    setIsEditing(true);
                  }}
                >
                  <EditIcon fontSize="inherit" />
                </S.ActionIcon>
              </Tooltip>

              <Tooltip title={secondaryActionTooltip}>
                <S.ActionIcon onClick={handleToggleDone}>
                  <SecondaryActionIcon fontSize="inherit" />
                </S.ActionIcon>
              </Tooltip>
            </S.ActionWrapper>
          </S.ActionGroup>
        )}
      </S.Container>

      <EditTaskModal
        open={isModalOpen}
        task={task}
        onSave={saveTask}
        onClose={() => setModalOpen(false)}
        onDeleteTask={handleDelete}
      />
    </>
  );
}
