import {
  LocalFireDepartment as FireIcon,
  NotificationsActive as AlertIcon,
  Security as ShieldIcon,
} from '@mui/icons-material';
import { alpha, Paper, Stack, Typography, useTheme } from '@mui/material';
import type { DragEvent, ElementType } from 'react';

import { TaskCard } from '@/components/TaskCard';
import type { Task } from '@/types/task';

interface MatrixQuadrantProps {
  title: string;
  tasks: Task[];
  quadrantColor: string; // CSS color string
  important: boolean;
  urgent: boolean;
  signals: string[];
  examples: string[];
  onTaskDragStart: (task: Task, e: DragEvent<HTMLDivElement>) => void;
  onTaskDragOver: (e: DragEvent<HTMLDivElement>) => void;
  onTaskDrop: (e: DragEvent<HTMLDivElement>) => void;
}

export function MatrixQuadrant({
  title,
  tasks,
  quadrantColor,
  important,
  urgent,
  onTaskDragStart,
  onTaskDragOver,
  onTaskDrop,
}: MatrixQuadrantProps) {
  const theme = useTheme();

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

  return (
    <Paper
      data-important={important}
      data-urgent={urgent}
      onDragOver={onTaskDragOver}
      onDrop={onTaskDrop}
      sx={{
        bgcolor: alpha(quadrantColor, 0.1),
        p: 2,
        boxShadow: 1,
        borderRadius: theme.shape.borderRadius,
      }}
    >
      <Stack direction="row" alignItems="center" gap={1} mb={2}>
        {hasIcon && <Icon color={iconColor} fontSize={iconSize} />}

        <Typography variant="h6" sx={{ color: quadrantColor }}>
          {title}
        </Typography>
      </Stack>

      <Stack direction="row" flexWrap="wrap" gap={1}>
        {tasks.length === 0 ? (
          <Typography variant="body2" color="textSecondary">
            No tasks found
          </Typography>
        ) : (
          tasks.map(task => (
            <Stack
              key={task.id}
              gap={1}
              draggable
              onDragStart={e => onTaskDragStart(task, e)}
              onDragOver={onTaskDragOver}
            >
              <TaskCard task={task} color={quadrantColor} eisenhowerIcons={false} />
            </Stack>
          ))
        )}
      </Stack>
    </Paper>
  );
}
