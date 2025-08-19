'use client';

import { DragEvent, useState } from 'react';

import { DescriptionOutlined as NotesIcon } from '@mui/icons-material';
import { Box, Stack, Tooltip, Typography, useTheme } from '@mui/material';

import { TaskContainer } from '@/legacy/components/task/TaskContainer';
import { customColors } from '@/legacy/styles/colors';
import type { Event } from '@/legacy/types/Event';
import { useResponsiveness } from '@/shared/hooks/useResponsiveness';

type ConvertibleEventCardProps = {
  event: Event;
  disabled?: boolean;
  hasDefaultWidth?: boolean;
  onTaskDragStart?: (id: string, e: DragEvent<HTMLDivElement>) => void;
  onTaskDragOver?: (id: string, e: DragEvent<HTMLDivElement>) => void;
  onTaskDragEnd?: (id: string, e: DragEvent<HTMLDivElement>) => void;
};

export function ConvertibleEventCard({
  event,
  disabled = false,
  hasDefaultWidth = true,
  onTaskDragStart,
  onTaskDragOver,
  onTaskDragEnd,
}: ConvertibleEventCardProps) {
  const theme = useTheme();
  const isMobile = useResponsiveness();

  // simple local drag feedback, do not memoize to keep code lean with React Compiler
  const [isDragging, setDragging] = useState(false);

  const title = (event as unknown as { title?: string }).title ?? 'Untitled Event';

  // Guard all handlers when disabled
  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.stopPropagation();
    setDragging(true);
    onTaskDragStart?.(event.id, e);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.preventDefault();
    onTaskDragOver?.(event.id, e);
  };

  const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    setDragging(false);
    onTaskDragEnd?.(event.id, e);
  };

  return (
    <TaskContainer
      color={customColors.purple.value}
      isDragging={isDragging}
      dense={isMobile}
      hasDefaultWidth={hasDefaultWidth}
      // disable native dragging on mobile or when disabled
      draggable={!isMobile && !disabled}
      onDragStart={!disabled ? handleDragStart : undefined}
      onDragOver={!disabled ? handleDragOver : undefined}
      onDragEnd={!disabled ? handleDragEnd : undefined}
      // a11y and visuals for disabled state
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      data-disabled={disabled ? 'true' : 'false'}
      sx={{
        gap: 0.25,
        px: 1,
        py: 1,
        minHeight: 'auto',
        opacity: disabled ? 0.55 : 1,
        cursor: disabled ? 'not-allowed' : 'grab',
        // keep layout stable while visually indicating disabled state
        filter: disabled ? 'grayscale(0.15)' : 'none',
        '&:active': { cursor: disabled ? 'not-allowed' : 'grabbing' },
      }}
    >
      <Stack direction="row" alignItems="center" flexGrow={1} gap={1}>
        {/* Small color circle */}
        <Stack
          direction="row"
          sx={{
            alignSelf: 'flex-start',
            alignContent: 'center',
            justifyContent: 'center',
            width: theme.spacing(2),
            p: theme.spacing(0.5),
          }}
        >
          <Box
            sx={{
              width: theme.spacing(1.5),
              height: theme.spacing(1.5),
              borderRadius: '50%',
              backgroundColor: event.calendar?.color || theme.palette.primary.main,
              flexShrink: 0,
            }}
          />
        </Stack>

        <Stack direction="column" flexGrow={1} gap={0.25}>
          <Stack direction="row" alignItems="center" flexWrap="wrap">
            {event.description && (
              <Tooltip title="Has description" disableInteractive>
                <NotesIcon
                  color="action"
                  sx={{
                    fontSize: theme.typography.caption.fontSize,
                    alignSelf: 'center',
                    mr: 0.25,
                  }}
                />
              </Tooltip>
            )}
            <Typography
              variant={'body2'}
              noWrap
              title={title}
              color={disabled ? 'text.disabled' : 'text.primary'}
            >
              {title}
            </Typography>
          </Stack>

          <Typography
            variant="caption"
            color={disabled || !event.calendar ? 'text.disabled' : 'text.secondary'}
          >
            {event.calendar?.name || 'No Calendar'}
          </Typography>
        </Stack>
      </Stack>
    </TaskContainer>
  );
}
