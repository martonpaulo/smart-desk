'use client';

import { useState } from 'react';

import { Box, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';

import { AddTaskInput } from '@/components/AddTaskInput';
import { PageContentLayout } from '@/components/PageContentLayout';
import { TaskCard } from '@/components/TaskCard';
import { useResponsiveness } from '@/hooks/useResponsiveness';
import { useTasks } from '@/hooks/useTasks';
import { customColors } from '@/styles/colors';
import { theme } from '@/styles/theme';
import { AddTaskFloatButton } from '@/widgets/TodoList/AddTaskFloatButton';

interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

/// reusable tab panel wrapper
function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tasks-tabpanel-${index}`}
      aria-labelledby={`tasks-tab-${index}`}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function TasksPage() {
  // track screen size
  const { isMobile } = useResponsiveness();

  // which tab is active: 0=all,1=done,2=trashed
  const [activeTab, setActiveTab] = useState(0);

  // filter by title
  const [filter, setFilter] = useState('');

  // track newly added task to auto‑open edit view
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // fetch tasks (filtered by title)
  const { activeTasks, doneTasks, trashedTasks, noDateTasks } = useTasks({ title: filter });

  // counts & dynamic titles/subtitles
  const counts = {
    all: activeTasks.length,
    done: doneTasks.length,
    total: activeTasks.length + doneTasks.length,
    trashed: trashedTasks.length,
    noDate: noDateTasks.length,
  };

  const percentDone = counts.total > 0 ? Math.round((counts.done / counts.total) * 100) : 0;

  const pageTitles = isMobile
    ? ['Tasks', 'No Date', 'Completed', 'Trashed']
    : ['Active Tasks', 'No Date Tasks', 'Completed Tasks', 'Trashed Tasks'];

  const subtitleAppendix = filter ? ` that match ${filter.toLocaleUpperCase()}` : '';

  const pageSubtitles = [
    `You have a total of ${counts.all} active task${counts.all !== 1 ? 's' : ''}${subtitleAppendix}`,
    `There are ${counts.noDate} task${counts.noDate !== 1 ? 's' : ''} without a planned date${subtitleAppendix}`,
    `You completed ${counts.done} task${counts.done !== 1 ? 's' : ''} of ${counts.total} tasks (${percentDone}%)${subtitleAppendix}`,
    `There are ${counts.trashed} task${counts.trashed !== 1 ? 's' : ''} in the trash${subtitleAppendix}`,
  ];

  const emptyListMessage = [
    'No active tasks found',
    'No tasks without a planned date',
    'No completed tasks found',
    'No trashed tasks found',
  ];

  // width for each card
  const cardWidth = isMobile ? '100%' : '250px';

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <PageContentLayout title={pageTitles[activeTab]} description={pageSubtitles[activeTab]}>
      {/* filter input */}
      <Stack direction="row" gap={2} alignItems="center">
        <TextField
          placeholder="Filter Tasks by Title"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          variant="outlined"
          sx={{ width: cardWidth }}
          size="small"
          slotProps={{
            input: {
              sx: {
                ...(!isMobile ? theme.typography.body2 : {}),
              },
            },
          }}
        />

        {!isMobile && (
          <AddTaskInput
            variant="outlined"
            columnProperties={{ color: customColors.grey.value }}
            sx={{ width: cardWidth }}
            onFinishAdding={newId => setEditingTaskId(newId)}
          />
        )}
      </Stack>

      {/* if on mobile, show add task button */}

      {/* tabs navigation */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        aria-label="tasks view tabs"
        variant={isMobile ? 'fullWidth' : 'standard'}
      >
        {pageTitles.map((title, index) => (
          <Tab
            key={index}
            label={title}
            id={`tasks-tab-${index}`}
            aria-controls={`tasks-tabpanel-${index}`}
          />
        ))}
      </Tabs>

      {/* Active Tasks panel */}
      <TabPanel value={activeTab} index={0}>
        {activeTasks.length > 0 ? (
          <Stack direction="row" gap={1} flexWrap="wrap">
            {activeTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                color={customColors.blue.value}
                width={cardWidth}
                editTask={editingTaskId === task.id}
                onFinishEditing={() => setEditingTaskId(null)}
              />
            ))}
          </Stack>
        ) : (
          <Typography>{emptyListMessage[0]}</Typography>
        )}
        {/* on mobile, floating add button */}
        {isMobile && <AddTaskFloatButton />}
      </TabPanel>

      {/* No Date Tasks panel */}
      <TabPanel value={activeTab} index={1}>
        {noDateTasks.length > 0 ? (
          <Stack direction="row" gap={1} flexWrap="wrap">
            {noDateTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                color={customColors.yellow.value}
                width={cardWidth}
              />
            ))}
          </Stack>
        ) : (
          <Typography>{emptyListMessage[1]}</Typography>
        )}
      </TabPanel>

      {/* Completed Tasks panel */}
      <TabPanel value={activeTab} index={2}>
        {doneTasks.length > 0 ? (
          <Stack direction="row" gap={1} flexWrap="wrap">
            {doneTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                color={customColors.green.value}
                width={cardWidth}
              />
            ))}
          </Stack>
        ) : (
          <Typography>{emptyListMessage[2]}</Typography>
        )}
      </TabPanel>

      {/* Trashed Tasks panel */}
      <TabPanel value={activeTab} index={3}>
        {trashedTasks.length > 0 ? (
          <Stack direction="row" gap={1} flexWrap="wrap">
            {trashedTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                color={customColors.grey.value}
                width={cardWidth}
              />
            ))}
          </Stack>
        ) : (
          <Typography>{emptyListMessage[3]}</Typography>
        )}
      </TabPanel>
    </PageContentLayout>
  );
}
