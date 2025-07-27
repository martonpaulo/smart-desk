import { type DragEvent, type ElementType, useState } from 'react';

import {
  Add as AddIcon,
  LocalFireDepartment as FireIcon,
  NotificationsActive as AlertIcon,
  Security as ShieldIcon,
} from '@mui/icons-material';
import { alpha, darken, IconButton, Paper, Stack, Typography, useTheme } from '@mui/material';

import { TaskCard } from '@/legacy/components/task/TaskCard';
import { TaskModal } from '@/legacy/components/task/TaskModal';
import { Task } from '@/legacy/types/task';

interface EisenhowerQuadrantProps {
  title: string;
  action: string;
  tasks: Task[];
  quadrantColor: string; // CSS color string
  important: boolean;
  urgent: boolean;
  questions: string[];
  examples: string[];
  isDragInProgress: boolean;
  onTaskDragStart: (task: Task, e: DragEvent<HTMLDivElement>) => void;
  onTaskDragOver: (e: DragEvent<HTMLDivElement>) => void;
  onTaskDragEnd: () => void;
  onTaskDrop: (e: DragEvent<HTMLDivElement>) => void;
  selectable?: boolean;
  selectedTaskIds?: Set<string>;
  onTaskSelectChange?: (id: string, selected: boolean) => void;
}

export function EisenhowerQuadrant({
  title,
  action,
  tasks,
  quadrantColor,
  important,
  urgent,
  questions,
  examples,
  isDragInProgress,
  onTaskDragStart,
  onTaskDragOver,
  onTaskDragEnd,
  onTaskDrop,
  selectable = false,
  selectedTaskIds = new Set<string>(),
  onTaskSelectChange,
}: EisenhowerQuadrantProps) {
  const theme = useTheme();
  const [openTaskModal, setOpenTaskModal] = useState(false);

  // Set default icon
  let Icon: ElementType = AlertIcon;
  let iconColor = 'action';
  let hasIcon = true;
  let iconSize = 'medium';

  if (important && urgent) {
    Icon = FireIcon;
    iconColor = 'error';
    iconSize = 'large';
  } else if (important && !urgent) {
    Icon = ShieldIcon;
    iconColor = 'info';
  } else if (!important && urgent) {
    Icon = AlertIcon;
    iconColor = 'warning';
  } else {
    hasIcon = false;
  }

  const examplesText = `Examples: ${examples.join(', ')}`;

  return (
    <>
      <Paper
        data-important={important}
        data-urgent={urgent}
        onDragOver={onTaskDragOver}
        onDrop={onTaskDrop}
        sx={{
          bgcolor: alpha(quadrantColor, 0.1),
          p: 2,
          pb: 6,
          minHeight: 320,
          boxShadow: 1,
          borderRadius: theme.shape.borderRadius,
          boxSizing: 'border-box',
          border: isDragInProgress ? `3px dashed ${quadrantColor}` : undefined,
          position: 'relative',
        }}
      >
        <Stack direction="row" alignItems="center" gap={1} mb={1}>
          {hasIcon && <Icon color={iconColor} fontSize={iconSize} />}

          <Typography variant="h6" sx={{ color: quadrantColor }}>
            {title}
          </Typography>
        </Stack>

        {!isDragInProgress && (
          <Typography
            variant="subtitle2"
            sx={{
              color: alpha(darken(quadrantColor, 0.4), 0.6),
              position: 'absolute',
              bottom: 16,
              right: 16,
            }}
          >
            {`${action.toLocaleUpperCase()}!`}
          </Typography>
        )}

        <Stack
          gap={2.5}
          textAlign="center"
          p={2}
          sx={{
            color: theme.palette.text.secondary,
            position: 'absolute',
            top: 48,
            left: 0,
            right: 0,
            visibility: isDragInProgress ? 'visible' : 'hidden',
            pointerEvents: 'none',
          }}
        >
          <Stack component="ul" gap={1} sx={{ listStyle: 'none', p: 0, m: 0 }}>
            {questions.map(question => (
              <Typography component="li" key={question}>
                {question}
              </Typography>
            ))}
          </Stack>
          <Typography variant="body2">{examplesText}</Typography>
        </Stack>

        <Stack
          direction="row"
          flexWrap="wrap"
          gap={1}
          sx={{
            opacity: isDragInProgress ? 0.001 : 1,
          }}
        >
          {tasks.length === 0 ? (
            <Typography variant="body2" color="textSecondary">
              No tasks found
            </Typography>
          ) : (
            tasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                color={quadrantColor}
                eisenhowerIcons={false}
                showActions={!isDragInProgress && !selectable}
                selectable={selectable}
                selected={selectedTaskIds.has(task.id)}
                onSelectChange={onTaskSelectChange}
                onTaskDragStart={(_id, e) => onTaskDragStart(task, e)}
                onTaskDragOver={(_id, e) => onTaskDragOver(e)}
                onTaskDragEnd={onTaskDragEnd}
              />
            ))
          )}

          <IconButton
            size="small"
            onClick={() => setOpenTaskModal(true)}
            sx={{
              aspectRatio: '1 / 1',
              alignSelf: 'center',
            }}
          >
            <AddIcon />
          </IconButton>
        </Stack>
      </Paper>

      <TaskModal
        open={openTaskModal}
        newProperties={{ important, urgent }}
        onClose={() => setOpenTaskModal(false)}
      />
    </>
  );
}
