import {
  LocalFireDepartment as FireIcon,
  NotificationsActive as AlertIcon,
  Security as ShieldIcon,
} from '@mui/icons-material';
import { alpha, Paper, Stack, Typography, useTheme } from '@mui/material';
import type { DragEvent, ElementType } from 'react';

import { TaskCard } from '@/components/TaskCard';
import type { Task } from '@/types/task';

interface EisenhowerQuadrantProps {
  title: string;
  action: string;
  tasks: Task[];
  quadrantColor: string; // CSS color string
  important: boolean;
  urgent: boolean;
  signals: string[];
  examples: string[];
  isDragInProgress: boolean;
  onTaskDragStart: (task: Task, e: DragEvent<HTMLDivElement>) => void;
  onTaskDragOver: (e: DragEvent<HTMLDivElement>) => void;
  onTaskDragEnd: () => void;
  onTaskDrop: (e: DragEvent<HTMLDivElement>) => void;
}

export function EisenhowerQuadrant({
  title,
  action,
  tasks,
  quadrantColor,
  important,
  urgent,
  isDragInProgress,
  onTaskDragStart,
  onTaskDragOver,
  onTaskDragEnd,
  onTaskDrop,
}: EisenhowerQuadrantProps) {
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
        border: isDragInProgress ? `2px dashed ${quadrantColor}` : undefined,
      }}
    >
      <Stack direction="row" alignItems="center" gap={1} mb={1}>
        {hasIcon && <Icon color={iconColor} fontSize={iconSize} />}

        <Typography variant="h6" sx={{ color: quadrantColor }}>
          {title}
        </Typography>
      </Stack>
      <Typography variant="subtitle2" color="textSecondary" mb={2}>
        {action}
      </Typography>

      {isDragInProgress ? (
        <Stack gap={1}>
          <Typography variant="subtitle2">Signals</Typography>
          <Stack component="ul" gap={0.5} sx={{ pl: 2, listStyle: 'disc' }}>
            {signals.map(signal => (
              <Typography component="li" variant="body2" key={signal}>
                {signal}
              </Typography>
            ))}
          </Stack>
          <Typography variant="subtitle2">Examples</Typography>
          <Stack component="ul" gap={0.5} sx={{ pl: 2, listStyle: 'disc' }}>
            {examples.map(example => (
              <Typography component="li" variant="body2" key={example}>
                {example}
              </Typography>
            ))}
          </Stack>
        </Stack>
      ) : (
        <Stack direction="row" flexWrap="wrap" gap={1}>
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
                onTaskDragStart={onTaskDragStart}
                onTaskDragOver={onTaskDragOver}
                onTaskDragEnd={onTaskDragEnd}
              />
            ))
          )}
        </Stack>
      )}
    </Paper>
  );
}
