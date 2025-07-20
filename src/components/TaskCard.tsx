'use client';

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
import {
  BoxProps,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip,
} from '@mui/material';

import { SyncedSyncIcon } from '@/components/SyncedSyncIcon';
import * as S from '@/components/TaskCard.styles';
import { defaultColumns } from '@/config/defaultColumns';
import { useResponsiveness } from '@/hooks/useResponsiveness';
import { useBoardStore } from '@/store/board/store';
import { useSyncStatusStore } from '@/store/syncStatus';
import { InterfaceSound } from '@/types/interfaceSound';
import type { Task } from '@/types/task';
import { isTaskEmpty } from '@/utils/boardHelpers';
import { playInterfaceSound } from '@/utils/soundPlayer';
import { EditTaskModal } from '@/widgets/TodoList/EditTaskModal';

interface TaskCardProps extends BoxProps {
  task: Task;
  color: string;
  eisenhowerIcons?: boolean;
  editTask?: boolean;
  onFinishEditing?: () => void;
  onTaskDragStart?: (id: string, e: DragEvent<HTMLDivElement>) => void;
  onTaskDragOver?: (id: string, e: DragEvent<HTMLDivElement>) => void;
}

export function TaskCard({
  task,
  color,
  eisenhowerIcons = true,
  editTask = false,
  onFinishEditing,
  onTaskDragStart,
  onTaskDragOver,
  ...props
}: TaskCardProps) {
  const { isMobile } = useResponsiveness();

  const cardMinHeight = isMobile ? '3.5rem' : 'auto';

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
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isToggleConfirmOpen, setToggleConfirmOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // sync edit mode if parent toggles it
  useEffect(() => {
    setIsEditing(editTask);
  }, [editTask]);

  // focus the input when inline‐editing
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
      onTaskDragStart?.(task.id, e);
    },
    [onTaskDragStart, task.id],
  );

  const handleDragOver = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      onTaskDragOver?.(task.id, e);
    },
    [onTaskDragOver, task.id],
  );

  // common save logic for edits
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
    onFinishEditing?.();
    saveTask({ ...task, title });
  }, [onFinishEditing, saveTask, task, title]);

  //
  // MARK AS DONE LOGIC
  //

  // actual toggle logic, extracted from confirm
  const doToggleDone = useCallback(async () => {
    const now = new Date();
    const { quantityTarget } = task;
    let { quantityDone, columnId } = task;
    const next = quantityDone + 1;
    quantityDone = next > quantityTarget ? 0 : next;
    let soundId: InterfaceSound = 'info';

    // move to Done column on target
    if (quantityDone === quantityTarget) {
      soundId = 'completed';
      const doneCol = columns.find(c => c.title === defaultColumns.done.title);
      if (doneCol) {
        columnId = doneCol.id;
        if (doneCol.trashed) {
          await updateColumn({ id: doneCol.id, trashed: false, updatedAt: now });
        }
      } else {
        columnId = await addColumn({
          title: defaultColumns.done.title,
          color: defaultColumns.done.color,
          updatedAt: now,
        });
      }
    }

    // reset to Todo when back to zero
    if (quantityDone === 0) {
      soundId = 'error';
      const todoCol = columns.find(c => c.title === defaultColumns.todo.title);
      if (todoCol) {
        columnId = todoCol.id;
        if (todoCol.trashed) {
          await updateColumn({ id: todoCol.id, trashed: false, updatedAt: now });
        }
      } else {
        columnId = await addColumn({
          title: defaultColumns.todo.title,
          color: defaultColumns.todo.color,
          updatedAt: now,
        });
      }
    }

    playInterfaceSound(soundId);
    await updateTask({ id: task.id, quantityDone, columnId, updatedAt: now });
    setInitial(prev => ({ ...prev, quantityDone, columnId, updatedAt: now }));
  }, [addColumn, columns, task, updateColumn, updateTask]);

  // open confirmation dialog instead of window.confirm
  const handleToggleClick = useCallback(() => {
    setToggleConfirmOpen(true);
  }, []);

  // user confirmed toggle
  const confirmToggle = useCallback(async () => {
    try {
      await doToggleDone();
    } catch (err) {
      console.error('Failed to toggle done', err);
    } finally {
      setToggleConfirmOpen(false);
    }
  }, [doToggleDone]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        const now = new Date();
        await updateTask({ id, trashed: true, updatedAt: now });
        setInitial(prev => ({ ...prev, trashed: true, updatedAt: now }));
        setEditModalOpen(false);
      } catch (err) {
        console.error('Failed to delete task', err);
      }
    },
    [updateTask],
  );

  // choose icon based on count vs done
  const done = task.quantityDone === task.quantityTarget;
  const isCountTask = task.quantityTarget > 1;

  let SecondaryActionIcon = CheckIcon;
  let secondaryActionTooltip = 'Mark as done';
  let toggleConfirmTitle = 'Confirm completion';
  let toggleConfirmText = 'Are you sure you want to mark this task as <b>done</b>?';

  if (done) {
    SecondaryActionIcon = UndoIcon;
    secondaryActionTooltip = 'Undo completion';
    toggleConfirmTitle = 'Confirm undo';
    toggleConfirmText = 'Are you sure you want to <b>undo</b> this task completion?';
  } else if (isCountTask) {
    SecondaryActionIcon = AddIcon;
    secondaryActionTooltip = 'Increment count';
    toggleConfirmTitle = 'Confirm increment';
    toggleConfirmText = 'Are you sure you want to <b>increment</b> this task?';
  }

  const shouldShowIcons = eisenhowerIcons
    ? !isEditing && (!task.isSynced || task.important || task.urgent || task.notes)
    : !isEditing && (!task.isSynced || task.notes);

  const itemsGap = isMobile ? 0.75 : 0.5;

  return (
    <>
      <S.Container
        color={color}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        draggable={!isEditing && !isMobile}
        minHeight={cardMinHeight}
        gap={itemsGap}
        paddingX={isMobile ? 2 : 1.5}
        paddingY={1.5}
        {...props}
      >
        {shouldShowIcons && (
          <S.Icons gap={itemsGap}>
            {!task.isSynced && (
              <SyncedSyncIcon status={syncStatus} fontSize="inherit" color="action" />
            )}
            {task.important && task.urgent && eisenhowerIcons && (
              <Tooltip title="Important & urgent">
                <FireIcon fontSize={isMobile ? 'medium' : 'small'} color="error" />
              </Tooltip>
            )}
            {task.important && !task.urgent && eisenhowerIcons && (
              <Tooltip title="Important">
                <ShieldIcon fontSize={isMobile ? 'small' : 'inherit'} color="action" />
              </Tooltip>
            )}
            {task.urgent && !task.important && eisenhowerIcons && (
              <Tooltip title="Urgent">
                <AlertIcon fontSize={isMobile ? 'small' : 'inherit'} color="warning" />
              </Tooltip>
            )}
            {task.notes && (
              <Tooltip title="Has notes">
                <NotesIcon fontSize={isMobile ? 'small' : 'inherit'} color="action" />
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
              <S.TitleText
                onClick={() => setEditModalOpen(true)}
                done={done}
                untitled={!task.title}
                textVariantSize={isMobile ? 'body1' : 'body2'}
              >
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
              {!isMobile && (
                <Tooltip title="Rename task">
                  <S.ActionIcon
                    onClick={() => {
                      setTitle(task.title);
                      setIsEditing(true);
                    }}
                  >
                    <EditIcon fontSize={isMobile ? 'medium' : 'inherit'} />
                  </S.ActionIcon>
                </Tooltip>
              )}

              <Tooltip title={secondaryActionTooltip}>
                <S.ActionIcon onClick={handleToggleClick}>
                  <SecondaryActionIcon fontSize={isMobile ? 'medium' : 'inherit'} />
                </S.ActionIcon>
              </Tooltip>
            </S.ActionWrapper>
          </S.ActionGroup>
        )}
      </S.Container>

      {/* edit & delete modal */}
      <EditTaskModal
        open={isEditModalOpen}
        task={task}
        onSave={saveTask}
        onClose={() => setEditModalOpen(false)}
        onDeleteTask={handleDelete}
      />

      {/* confirm dialog for mark‐done */}
      <Dialog open={isToggleConfirmOpen} onClose={() => setToggleConfirmOpen(false)}>
        <DialogTitle>{toggleConfirmTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText dangerouslySetInnerHTML={{ __html: toggleConfirmText }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setToggleConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={confirmToggle}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
