'use client';

import { useState } from 'react';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  alpha,
  Box,
  Paper,
  Stack,
  styled,
  Typography,
  useTheme,
} from '@mui/material';

import { useResponsiveness } from '@/hooks/useResponsiveness';
import { useBoardStore } from '@/store/board/store';
import type { Column } from '@/types/column';
import type { Task } from '@/types/task';
import { TodoTaskCard } from '@/widgets/TodoList/TodoTaskCard';

// styled Paper for each quadrant
const QuadrantContainer = styled(Paper, {
  shouldForwardProp: prop => prop !== 'bgcolor',
})<{ bgcolor: string }>(({ theme, bgcolor }) => ({
  backgroundColor: bgcolor,
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  overflow: 'hidden',
}));

// bold title for quadrant
const QuadrantHeader = styled(Typography)(({ theme }) => ({
  fontWeight: theme.typography.fontWeightBold,
  marginBottom: theme.spacing(1),
}));

type QuadrantProps = {
  title: string;
  tasks: Task[];
  columns: Column[];
  bgcolor: string;
  important: boolean;
  urgent: boolean;
  onOpen: (task: Task) => void;
  onRename: (task: Task) => void;
  onToggleDone: (task: Task) => void;
  onDragStart: (task: Task, e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
};

function Quadrant({
  title,
  tasks,
  columns,
  bgcolor,
  important,
  urgent,
  onOpen,
  onRename,
  onToggleDone,
  onDragStart,
  onDragOver,
  onDrop,
}: QuadrantProps) {
  return (
    <QuadrantContainer
      bgcolor={bgcolor}
      data-important={important}
      data-urgent={urgent}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <QuadrantHeader variant="h6">{title}</QuadrantHeader>
      <Stack
        direction="row"
        flexWrap="wrap"
        gap={1}
        overflow="auto"
        sx={{
          '& > *': {
            flexBasis: 'calc(50% - 8px)', // 50% width minus gap
            maxWidth: 'calc(50% - 8px)',
          },
        }}
      >
        {tasks.length > 0 ? (
          tasks.map(task => {
            const column = columns.find(c => c.id === task.columnId);
            if (!column) return null;
            return (
              <Stack width="45%" key={task.id}>
                <TodoTaskCard
                  task={task}
                  column={column}
                  onOpen={() => onOpen(task)}
                  onRename={() => onRename(task)}
                  onToggleDone={() => onToggleDone(task)}
                  onDragStart={() => onDragStart(task)}
                  onDragOver={onDragOver}
                />
              </Stack>
            );
          })
        ) : (
          <Typography variant="body2" color="textSecondary">
            No tasks found
          </Typography>
        )}
      </Stack>
    </QuadrantContainer>
  );
}

export default function EisenhowerMatrixPage() {
  const tasks = useBoardStore(s => s.tasks);
  const columns = useBoardStore(s => s.columns);
  const { isMobile } = useResponsiveness();
  const theme = useTheme();

  // exclude trashed tasks
  const active = tasks.filter(t => !t.trashed && t.quantityDone !== t.quantityTarget);

  // split into 4 lists
  const q1 = active.filter(t => t.important && t.urgent);
  const q2 = active.filter(t => t.important && !t.urgent);
  const q3 = active.filter(t => !t.important && t.urgent);
  const q4 = active.filter(t => !t.important && !t.urgent);

  // ── drag and drop handlers ────────────────────────────────────────────
  const updateTask = useBoardStore(s => s.updateTask);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const handleDragStart = (task: Task, e: React.DragEvent) => {
    if (isMobile) return;
    e.dataTransfer.effectAllowed = 'move';
    setDraggingId(task.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (isMobile) return;
    e.preventDefault();
  };

  const handleDrop = (important: boolean, urgent: boolean) =>
    async (e: React.DragEvent) => {
      if (isMobile) return;
      e.preventDefault();
      if (!draggingId) return;
      try {
        await updateTask({
          id: draggingId,
          important,
          urgent,
          updatedAt: new Date(),
        });
      } finally {
        setDraggingId(null);
      }
    };

  const noop = () => {};

  // config for each quadrant
  const quadrants = [
    {
      title: 'Important & Urgent',
      tasks: q1,
      bgcolor: alpha(theme.palette.error.light, 0.25),
      important: true,
      urgent: true,
    },
    {
      title: 'Important & Not Urgent',
      tasks: q2,
      bgcolor: alpha(theme.palette.primary.light, 0.25),
      important: true,
      urgent: false,
    },
    {
      title: 'Not Important & Urgent',
      tasks: q3,
      bgcolor: alpha(theme.palette.warning.light, 0.25),
      important: false,
      urgent: true,
    },
    {
      title: 'Not Important & Not Urgent',
      tasks: q4,
      bgcolor: alpha(theme.palette.grey[100], 0.25),
      important: false,
      urgent: false,
    },
  ];

  if (isMobile) {
    // mobile: collapsible accordions
    return (
      <Stack spacing={2} p={1}>
        {quadrants.map(({ title, tasks, bgcolor }) => (
          <Accordion key={title} disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">{title}</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <QuadrantContainer bgcolor={bgcolor}>
                <Stack>
                  {tasks.length > 0 ? (
                    tasks.map(task => {
                      const column = columns.find(c => c.id === task.columnId);
                      if (!column) return null;
                      return (
                        <TodoTaskCard
                          key={task.id}
                          task={task}
                          column={column}
                          onOpen={noop}
                          onRename={noop}
                          onToggleDone={noop}
                          onDragStart={noop}
                          onDragOver={handleDragOver}
                        />
                      );
                    })
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No tasks found
                    </Typography>
                  )}
                </Stack>
              </QuadrantContainer>
            </AccordionDetails>
          </Accordion>
        ))}
      </Stack>
    );
  }

  // desktop: 2x2 grid layout
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridAutoRows: '1fr',
        gap: 2,
        p: 2,
        height: '90vh', // viewport height
        width: '90vw', // viewport width
        boxSizing: 'border-box',
        overflow: 'hidden', // no page scroll
      }}
    >
      {quadrants.map(({ title, tasks, bgcolor, important, urgent }) => (
        <Quadrant
          key={title}
          title={title}
          tasks={tasks}
          columns={columns}
          bgcolor={bgcolor}
          important={important}
          urgent={urgent}
          onOpen={noop}
          onRename={noop}
          onToggleDone={noop}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop(important, urgent)}
        />
      ))}
    </Box>
  );
}
