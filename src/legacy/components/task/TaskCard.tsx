'use client';

import { DragEvent, useEffect, useMemo, useRef, useState } from 'react';

import { DescriptionOutlined as NotesIcon } from '@mui/icons-material';
import { Checkbox, Stack, Tooltip, Typography, useTheme } from '@mui/material';
import { isBefore, startOfDay } from 'date-fns';

import { TagLabel } from '@/features/tag/components/TagLabel';
import { useTagsStore } from '@/features/tag/store/useTagsStore';
import { IncrementButton } from '@/features/task/components/IncrementButton';
import { MarkAsDoneButton } from '@/features/task/components/MarkAsDoneButton';
import { RecoverFromTrashButton } from '@/features/task/components/RecoverFromTrashButton';
import { ResetButton } from '@/features/task/components/ResetButton';
import { SendToInboxButton } from '@/features/task/components/SendToInboxButton';
import { UnblockButton } from '@/features/task/components/UnblockButton';
import { ActionsBar } from '@/legacy/components/task/ActionsBar';
import { PriorityFlag } from '@/legacy/components/task/PriorityFlag';
import { SyncedSyncIcon, SyncStatus } from '@/legacy/components/task/SyncedSyncIcon';
import { TaskContainer } from '@/legacy/components/task/TaskContainer';
import { TaskModal } from '@/legacy/components/task/TaskModal';
import { TitleBlock } from '@/legacy/components/task/TitleBlock';
import { MetaRow } from '@/legacy/components/task/TitleMetaRow';
import { useBoardStore } from '@/legacy/store/board/store';
import { useSyncStatusStore } from '@/legacy/store/syncStatus';
import type { Task } from '@/legacy/types/task';
import { isTaskEmpty } from '@/legacy/utils/taskUtils';
import { getDateLabel } from '@/legacy/utils/timeUtils';
import { useResponsiveness } from '@/shared/hooks/useResponsiveness';
import { formatFullDuration } from '@/shared/utils/timeUtils';

type TaskCardBaseProps = {
  task: Task;
  color: string;
  hasDefaultWidth?: boolean;
  eisenhowerIcons?: boolean;
  showDuration?: boolean;
  showDaily?: boolean;
  showTag?: boolean;
  editTask?: boolean;
  showActions?: boolean;
  showDate?: boolean;
  selectable?: boolean;
  selected?: boolean;
  onSelectChange?: (id: string, selected: boolean) => void;
  onFinishEditing?: () => void;
  onTaskDragStart?: (id: string, e: DragEvent<HTMLDivElement>) => void;
  onTaskDragOver?: (id: string, e: DragEvent<HTMLDivElement>) => void;
  onTaskDragEnd?: (id: string, e: DragEvent<HTMLDivElement>) => void;
};

export function TaskCard({
  task,
  color,
  hasDefaultWidth,
  eisenhowerIcons = true,
  showDaily = true,
  showDuration = true,
  showTag = true,
  editTask = false,
  showActions = true,
  showDate = true,
  selectable = false,
  selected = false,
  onSelectChange,
  onFinishEditing,
  onTaskDragStart,
  onTaskDragOver,
  onTaskDragEnd,
}: TaskCardBaseProps) {
  const isMobile = useResponsiveness();
  const theme = useTheme();
  const syncStatus = useSyncStatusStore(s => s.status);
  const mappedStatus = useMemo<SyncStatus | undefined>(
    () => syncStatus as SyncStatus,
    [syncStatus],
  );

  // tags
  // Memoize the filtered tags to avoid unnecessary re-renders
  const allTags = useTagsStore(s => s.items);
  const tags = useMemo(() => allTags.filter(t => !t.trashed), [allTags]);
  const taskTag = useMemo(() => tags.find(t => t.id === task.tagId), [tags, task.tagId]);

  // local edit state
  const [isEditing, setIsEditing] = useState(editTask);
  const [title, setTitle] = useState(task.title);
  const [initial, setInitial] = useState(task);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // drag feedback
  const [isDragging, setDragging] = useState(false);

  // sync parent controlled edit flag
  useEffect(() => setIsEditing(editTask), [editTask]);

  // focus input when switching to inline edit
  useEffect(() => {
    if (isEditing && inputRef.current) {
      const inp = inputRef.current;
      inp.focus();
      inp.setSelectionRange(inp.value.length, inp.value.length);
    }
  }, [isEditing]);

  // board ops
  const updateTask = useBoardStore(s => s.updateTask);

  const saveTask = (updated: Task) => {
    if (isTaskEmpty(updated)) return;

    const changed =
      updated.title !== initial.title ||
      updated.notes !== initial.notes ||
      updated.important !== initial.important ||
      updated.urgent !== initial.urgent ||
      updated.blocked !== initial.blocked ||
      updated.daily !== initial.daily ||
      updated.quantityDone !== initial.quantityDone ||
      updated.quantityTarget !== initial.quantityTarget ||
      updated.columnId !== initial.columnId;

    if (!changed) return;

    const now = new Date();
    updateTask({ ...updated, updatedAt: now });
    setInitial({ ...updated, updatedAt: now });
  };

  const finishInlineEdit = () => {
    setIsEditing(false);
    onFinishEditing?.();
    saveTask({ ...task, title });
  };

  // derived UI flags
  const done = task.quantityDone === task.quantityTarget;
  const isCountTask = task.quantityTarget > 1;
  const oneToComplete = task.quantityDone + 1 === task.quantityTarget;

  const showIncrement =
    !isEditing && !task.blocked && !task.trashed && isCountTask && !done && !oneToComplete;
  const showMarkDone = !isEditing && !task.blocked && !task.trashed && !done && oneToComplete;
  const showUnblock = !isEditing && task.blocked && !done && !task.trashed;
  const showSendToInbox =
    !isEditing &&
    !done &&
    !task.trashed &&
    (!task.plannedDate || isBefore(task.plannedDate, startOfDay(new Date(Date.now() + 86400000))));
  const showReset = !isEditing && !task.blocked && done && !task.trashed;
  const showRecover = !isEditing && task.trashed;

  // drag handlers
  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    if (selectable) return;
    e.stopPropagation();
    setDragging(true);
    onTaskDragStart?.(task.id, e);
  };
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    if (selectable) return;
    e.preventDefault();
    onTaskDragOver?.(task.id, e);
  };
  const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
    if (selectable) return;
    setDragging(false);
    onTaskDragEnd?.(task.id, e);
  };

  const toggleSelected = () => {
    if (selectable) onSelectChange?.(task.id, !selected);
  };

  let taskColor = color;
  let opacity = 1;

  if (!isEditing) {
    if (task.trashed) {
      taskColor = theme.palette.grey[500];
      opacity = 0.3;
    } else if (task.blocked) {
      taskColor = theme.palette.action.disabled;
      opacity = 0.6;
    }
  }

  return (
    <>
      <TaskContainer
        color={taskColor}
        selected={selected}
        draggable={!isEditing && !isMobile && !selectable}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onClick={toggleSelected}
        isDragging={isDragging}
        dense={isMobile}
        hasDefaultWidth={hasDefaultWidth}
      >
        {selectable && (
          <Checkbox
            size="small"
            checked={selected}
            onClick={e => e.stopPropagation()}
            onChange={e => onSelectChange?.(task.id, e.target.checked)}
            sx={{ p: 0 }}
          />
        )}

        <PriorityFlag task={task} showEisenhowerIcons={eisenhowerIcons} sx={{ opacity }} />

        {!task.isSynced && (
          <SyncedSyncIcon status={mappedStatus} fontSize="inherit" color="action" />
        )}

        <Stack direction="column" flexGrow={1} gap={0.5}>
          {isEditing ? (
            <TitleBlock
              mode="edit"
              title={title}
              inputRef={inputRef as React.RefObject<HTMLInputElement>}
              onChangeTitle={setTitle}
              onBlurSave={finishInlineEdit}
              onCancel={() => {
                setIsEditing(false);
                onFinishEditing?.();
                setTitle(task.title);
              }}
            />
          ) : (
            <>
              <Stack direction="row" justifyContent="space-between" gap={1}>
                <Stack direction="row" alignItems="center" flexWrap="wrap">
                  {task.notes && (
                    <Tooltip title="Has notes">
                      <NotesIcon
                        color={task.trashed || task.blocked ? 'disabled' : 'action'}
                        sx={{
                          fontSize: theme.typography.caption.fontSize,
                          alignSelf: 'center',
                          mr: 0.5,
                        }}
                      />
                    </Tooltip>
                  )}

                  <TitleBlock
                    mode="read"
                    title={task.title || 'Untitled Task'}
                    done={done}
                    untitled={!task.title}
                    textVariantSize={isMobile ? 'body1' : 'body2'}
                    onClickTitle={selectable ? toggleSelected : () => setEditModalOpen(true)}
                    sx={{
                      opacity,
                      fontWeight: task.trashed ? 300 : 400,
                    }}
                  />

                  {!task.blocked && !task.trashed && task.daily && showDaily && (
                    <Tooltip title="Repeats daily">
                      <Typography
                        component="span"
                        sx={{
                          fontSize: 16,
                          lineHeight: 1,
                          fontWeight: 400,
                          transform: 'rotate(240deg) translateX(2px)',
                          color: 'text.secondary',
                          alignSelf: 'flex-start',
                          display: 'inline-block',
                        }}
                      >
                        ⟳
                      </Typography>
                    </Tooltip>
                  )}
                </Stack>

                {isCountTask && (
                  <Typography variant="caption" color="text.secondary" sx={{ opacity }}>
                    {task.quantityDone}/{task.quantityTarget}
                  </Typography>
                )}
              </Stack>

              <MetaRow
                opacity={opacity}
                tagComp={taskTag && showTag ? <TagLabel tag={taskTag} /> : null}
                durationComp={
                  showDuration ? (
                    <Typography
                      variant="caption"
                      color={task.estimatedTime ? 'text.secondary' : 'text.disabled'}
                    >
                      {task.estimatedTime
                        ? formatFullDuration(task.estimatedTime * 60_000)
                        : 'Unset'}
                    </Typography>
                  ) : null
                }
                separatorComp={
                  showDuration && showDate ? (
                    <Typography variant="caption" color="text.disabled">
                      |
                    </Typography>
                  ) : null
                }
                dateComp={
                  showDate ? (
                    <Typography
                      variant="caption"
                      color={task.plannedDate ? 'text.secondary' : 'text.disabled'}
                    >
                      {getDateLabel(task.plannedDate)}
                    </Typography>
                  ) : null
                }
              />
            </>
          )}
        </Stack>

        {!isEditing && showActions && (
          <ActionsBar
            showOnHover
            right
            items={[
              showSendToInbox ? <SendToInboxButton key="next" task={task} /> : null,
              showUnblock ? <UnblockButton key="unblock" task={task} /> : null,
              showIncrement ? <IncrementButton key="inc" task={task} /> : null,
              showReset ? <ResetButton key="reset" task={task} /> : null,
              showMarkDone ? <MarkAsDoneButton key="done" task={task} /> : null,
              showRecover ? <RecoverFromTrashButton key="recover" task={task} /> : null,
            ].filter(Boolean)}
          />
        )}
      </TaskContainer>

      <TaskModal open={isEditModalOpen} task={task} onCloseAction={() => setEditModalOpen(false)} />
    </>
  );
}
