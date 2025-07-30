'use client';

import { DragEvent, useCallback, useEffect, useRef, useState } from 'react';

import { DescriptionOutlined as NotesIcon } from '@mui/icons-material';
import { BoxProps, Checkbox, Stack, Tooltip, useTheme } from '@mui/material';

import { TagLabel } from '@/features/tag/components/TagLabel';
import { useTagsStore } from '@/features/tag/store/TagsStore';
import { IncrementButton } from '@/features/task/components/IncrementButton';
import { MarkAsDoneButton } from '@/features/task/components/MarkAsDoneButton';
import { ResetButton } from '@/features/task/components/ResetButton';
import { SendToNextDayButton } from '@/features/task/components/SendToNextDayButton';
import { UnblockButton } from '@/features/task/components/UnblockButton';
import { PriorityFlag } from '@/legacy/components/PriorityFlag';
import { SyncedSyncIcon } from '@/legacy/components/SyncedSyncIcon';
import * as S from '@/legacy/components/task/TaskCard.styles';
import { TaskModal } from '@/legacy/components/task/TaskModal';
import { useBoardStore } from '@/legacy/store/board/store';
import { useSyncStatusStore } from '@/legacy/store/syncStatus';
import { customColors } from '@/legacy/styles/colors';
import type { Task } from '@/legacy/types/task';
import { isTaskEmpty } from '@/legacy/utils/taskUtils';
import { getDateLabel } from '@/legacy/utils/timeUtils';
import { useResponsiveness } from '@/shared/hooks/useResponsiveness';
import { formatFullDuration } from '@/shared/utils/timeUtils';

interface TaskCardProps extends BoxProps {
  task: Task;
  color: string;
  eisenhowerIcons?: boolean;
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
}

export function TaskCard({
  task,
  color,
  eisenhowerIcons = true,
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
  ...props
}: TaskCardProps) {
  const { isMobile } = useResponsiveness();
  const theme = useTheme();
  const allTags = useTagsStore(s => s.items);
  const tags = allTags.filter(t => !t.trashed);

  const cardMinHeight = isMobile ? '3.5rem' : 'auto';

  // board actions
  const updateTask = useBoardStore(s => s.updateTask);
  const syncStatus = useSyncStatusStore(s => s.status);

  // local state
  const [isEditing, setIsEditing] = useState(editTask);
  const [title, setTitle] = useState(task.title);
  const [initial, setInitial] = useState(task);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setDragging] = useState(false);

  const toggleSelected = useCallback(() => {
    if (selectable) {
      onSelectChange?.(task.id, !selected);
    }
  }, [onSelectChange, selectable, selected, task.id]);

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
      setDragging(true);
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

  const handleDragEnd = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      setDragging(false);
      onTaskDragEnd?.(task.id, e);
    },
    [onTaskDragEnd, task.id],
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
        updated.blocked !== initial.blocked ||
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

  // choose icon based on count vs done
  const done = task.quantityDone === task.quantityTarget;
  const isCountTask = task.quantityTarget > 1;
  const oneToComplete = task.quantityDone + 1 === task.quantityTarget;

  const itemsGap = isMobile ? 0.75 : 0.5;
  const opacity = task.blocked ? 0.5 : 1;

  const displayIncrementButton =
    !isEditing && !task.blocked && isCountTask && !done && !oneToComplete;
  const displayMarkAsDoneButton = !isEditing && !task.blocked && !done && oneToComplete;
  const displayUnblockButton = !isEditing && task.blocked && !done;
  const displaySendToNextDayButton = !isEditing && !done;
  const displayResetButton = !isEditing && !task.blocked && done;

  const taskTag = tags.find(t => t.id === task.tagId);

  return (
    <>
      <S.Container
        color={task.blocked && !isEditing ? customColors.grey.value : color}
        onDragStart={selectable ? undefined : handleDragStart}
        onDragOver={selectable ? undefined : handleDragOver}
        onDragEnd={selectable ? undefined : handleDragEnd}
        draggable={!isEditing && !isMobile && !selectable}
        minHeight={cardMinHeight}
        gap={itemsGap}
        paddingX={isMobile ? 2 : 1.5}
        paddingY={1.5}
        onClick={toggleSelected}
        sx={{ cursor: isDragging ? 'grabbing' : undefined }}
        selected={selected}
        {...props}
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
        {!task.isSynced && <SyncedSyncIcon status={syncStatus} fontSize="inherit" color="action" />}

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
              <S.FirstRow>
                <S.TitleGroup>
                  {task.notes && (
                    <Tooltip title="Has notes">
                      <NotesIcon
                        color="action"
                        sx={{
                          fontSize: theme.typography.caption.fontSize,
                          alignSelf: 'center',
                          marginRight: 0.5,
                        }}
                      />
                    </Tooltip>
                  )}

                  <S.TitleText
                    onClick={selectable ? toggleSelected : () => setEditModalOpen(true)}
                    done={done}
                    untitled={!task.title}
                    textVariantSize={isMobile ? 'body1' : 'body2'}
                    showActions={showActions}
                    sx={{ opacity }}
                  >
                    {task.title || 'Untitled Task'}
                  </S.TitleText>

                  {!task.blocked && task.daily && (
                    <Tooltip title="Repeats daily">
                      <S.RepeatIndicator fontSize="inherit" />
                    </Tooltip>
                  )}
                </S.TitleGroup>

                <Stack>
                  {!task.blocked && isCountTask && (
                    <S.QuantityText sx={{ opacity }}>
                      {task.quantityDone}/{task.quantityTarget}
                    </S.QuantityText>
                  )}
                </Stack>
              </S.FirstRow>

              <Stack direction="row" alignItems="center" gap={0.5} sx={{ opacity }}>
                {taskTag && <TagLabel tag={taskTag} />}

                {task.estimatedTime && (
                  <S.EstimatedTimeText sx={{ opacity }}>
                    {formatFullDuration(task.estimatedTime * 60_000)}
                  </S.EstimatedTimeText>
                )}

                {showDate && (
                  <S.DateText sx={{ opacity }}>{getDateLabel(task.plannedDate)}</S.DateText>
                )}
              </Stack>
            </>
          )}
        </S.Content>

        {!isEditing && showActions && (
          <S.ActionGroup className="action-group">
            <S.ActionWrapper>
              {displaySendToNextDayButton && <SendToNextDayButton task={task} />}
              {displayUnblockButton && <UnblockButton task={task} />}
              {displayIncrementButton && <IncrementButton task={task} />}
              {displayResetButton && <ResetButton task={task} />}
              {displayMarkAsDoneButton && <MarkAsDoneButton task={task} />}
            </S.ActionWrapper>
          </S.ActionGroup>
        )}
      </S.Container>

      {/* edit & delete modal */}
      <TaskModal open={isEditModalOpen} task={task} onClose={() => setEditModalOpen(false)} />
    </>
  );
}
