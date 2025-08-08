import { type DragEvent, type ElementType, useState } from 'react';

import {
  Add as AddIcon,
  LocalFireDepartment as FireIcon,
  NotificationsActive as AlertIcon,
  Security as ShieldIcon,
} from '@mui/icons-material';
import {
  alpha,
  Chip,
  darken,
  Fab,
  IconButton,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';

import { TaskCard } from '@/legacy/components/task/TaskCard';
import { TaskModal } from '@/legacy/components/task/TaskModal';
import { Task } from '@/legacy/types/task';
import { CountChip } from '@/shared/components/CountChip';
import { useResponsiveness } from '@/shared/hooks/useResponsiveness';

interface EisenhowerQuadrantProps {
  title: string;
  action: string;
  tasks: Task[];
  quadrantColor: string; // CSS color string or theme palette value
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
  const isMobile = useResponsiveness();
  const [openTaskModal, setOpenTaskModal] = useState(false);

  const tasksCount = tasks.length;

  // Pick icon and tone using theme palette only
  let Icon: ElementType = AlertIcon;
  let iconColor: 'action' | 'error' | 'info' | 'warning' = 'action';
  let showIcon = true;
  let iconSize: 'small' | 'medium' | 'large' = isMobile ? 'small' : 'medium';

  if (important && urgent) {
    Icon = FireIcon;
    iconColor = 'error';
    iconSize = isMobile ? 'medium' : 'large';
  } else if (important && !urgent) {
    Icon = ShieldIcon;
    iconColor = 'info';
  } else if (!important && urgent) {
    Icon = AlertIcon;
    iconColor = 'warning';
  } else {
    showIcon = false;
  }

  const examplesText = `Examples: ${examples.join(', ')}`;

  const bgSubtle = alpha(quadrantColor, 0.1);
  const borderActive = `3px dashed ${quadrantColor}`; // old drag border
  const helperTextColor = alpha(darken(quadrantColor, 0.4), 0.7);

  return (
    <>
      <Paper
        component="section"
        aria-label={`${title} quadrant`}
        data-important={important}
        data-urgent={urgent}
        onDragOver={onTaskDragOver}
        onDrop={onTaskDrop}
        sx={{
          bgcolor: bgSubtle,
          p: { mobileSm: 1.5, mobileLg: 2 },
          pb: { mobileSm: 2.5, mobileLg: 6 },
          minHeight: { mobileSm: 220, mobileLg: 320 },
          boxShadow: 1,
          borderRadius: theme.shape.borderRadius,
          boxSizing: 'border-box',
          border: isDragInProgress ? borderActive : '1px solid',
          // keep the solid divider only when not dragging
          borderColor: isDragInProgress ? undefined : 'divider',
          position: 'relative',
          '& *': { WebkitTapHighlightColor: 'transparent' },
        }}
      >
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          gap={1}
          mb={{ mobileSm: 1, mobileLg: 2 }}
        >
          <Stack direction="row" alignItems="center" gap={1} minWidth={0}>
            {showIcon && <Icon color={iconColor} fontSize={iconSize} />}
            <Typography
              variant={isMobile ? 'subtitle1' : 'h6'}
              sx={{
                color: quadrantColor,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={title}
            >
              {title}
            </Typography>
            <CountChip count={tasksCount} color={quadrantColor} />
          </Stack>

          {/* Inline quick-add on phones */}
          <IconButton
            aria-label="Add task to this quadrant"
            size={isMobile ? 'small' : 'medium'}
            onClick={() => setOpenTaskModal(true)}
            sx={{ display: { mobileSm: 'inline-flex', mobileLg: 'none' } }}
          >
            <AddIcon fontSize={isMobile ? 'small' : 'medium'} />
          </IconButton>
        </Stack>

        {/* Drag helper overlay: only visible while dragging */}
        <Stack
          gap={2}
          textAlign="center"
          p={2}
          sx={{
            color: helperTextColor,
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
              <Typography component="li" key={question} variant="caption">
                {question}
              </Typography>
            ))}
          </Stack>
          <Typography variant="caption">{examplesText}</Typography>
        </Stack>

        {/* Cards grid. Hide content visually while dragging to emphasize drop zone */}
        <Stack
          direction="row"
          flexWrap="wrap"
          gap={{ mobileSm: 1, mobileLg: 1.5 }}
          sx={{
            minHeight: { mobileSm: 120, mobileLg: 160 },
            alignContent: 'flex-start',
            opacity: isDragInProgress ? 0.001 : 1,
          }}
        >
          {tasks.length === 0 ? (
            <Chip
              color="default"
              variant="outlined"
              label="No tasks here yet"
              sx={{ alignSelf: 'flex-start' }}
            />
          ) : (
            tasks.map(task => (
              <TaskCard
                key={task.id}
                hasDefaultWidth={false}
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
        </Stack>

        {/* Desktop/tablet floating Add */}
        <Fab
          color="primary"
          size="small"
          aria-label="Add task"
          onClick={() => setOpenTaskModal(true)}
          sx={{
            position: 'absolute',
            right: 12,
            bottom: 12,
            display: { mobileSm: 'none', mobileLg: 'inline-flex' },
          }}
        >
          <AddIcon />
        </Fab>

        {/* Action word only when not dragging */}
        <Typography
          variant="subtitle2"
          sx={{
            color: alpha(darken(quadrantColor, 0.4), 0.6),
            position: 'absolute',
            bottom: 16,
            left: 16,
            display: { mobileSm: 'none', mobileLg: isDragInProgress ? 'none' : 'block' },
          }}
        >
          {action.toUpperCase()}!
        </Typography>
      </Paper>

      <TaskModal
        open={openTaskModal}
        newProperties={{ important, urgent }}
        onClose={() => setOpenTaskModal(false)}
      />
    </>
  );
}
