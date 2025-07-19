'use client';

import { useState } from 'react';

import { Box, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';

import { PageContentLayout } from '@/components/PageContentLayout';
import { TaskCard } from '@/components/TaskCard';
import { useResponsiveness } from '@/hooks/useResponsiveness';
import { useTasks } from '@/hooks/useTasks';
import { colorMap } from '@/styles/colors';
import { theme } from '@/styles/theme';
import { AddTaskFloatButton } from '@/widgets/TodoList/AddTaskFloatButton';
import { AddTaskInput } from '@/widgets/TodoList/AddTaskInput';

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
  const { allTasks, doneTasks, trashedTasks } = useTasks(filter);

  // counts & dynamic titles/subtitles
  const counts = {
    all: allTasks.length,
    done: doneTasks.length,
    trashed: trashedTasks.length,
  };

  const pageTitles = ['All Tasks', 'Completed Tasks', 'Trashed Tasks'];

  const subtitleAppendix = filter ? ` that match ${filter.toLocaleUpperCase()}` : '';

  const pageSubtitles = [
    `You have a total of ${counts.all} task${counts.all !== 1 ? 's' : ''}${subtitleAppendix}`,
    `You have completed ${counts.done} task${counts.done !== 1 ? 's' : ''}${subtitleAppendix}`,
    `There are ${counts.trashed} task${counts.trashed !== 1 ? 's' : ''} in the trash${subtitleAppendix}`,
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
                ...theme.typography.body2,
              },
            },
          }}
        />

        {!isMobile && (
          <AddTaskInput
            variant="outlined"
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
        <Tab label="All Tasks" id="tasks-tab-0" aria-controls="tasks-tabpanel-0" />
        <Tab label="Completed Tasks" id="tasks-tab-1" aria-controls="tasks-tabpanel-1" />
        <Tab label="Trashed Tasks" id="tasks-tab-2" aria-controls="tasks-tabpanel-2" />
      </Tabs>

      {/* All Tasks panel */}
      <TabPanel value={activeTab} index={0}>
        {allTasks.length > 0 ? (
          <Stack direction="row" gap={1} flexWrap="wrap">
            {allTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                color={colorMap.orange.value}
                width={cardWidth}
                editTask={editingTaskId === task.id}
                onFinishEditing={() => setEditingTaskId(null)}
              />
            ))}
          </Stack>
        ) : (
          <Typography>No tasks found</Typography>
        )}
        {/* on mobile, floating add button */}
        {isMobile && <AddTaskFloatButton />}
      </TabPanel>

      {/* Completed Tasks panel */}
      <TabPanel value={activeTab} index={1}>
        {doneTasks.length > 0 ? (
          <Stack direction="row" gap={1} flexWrap="wrap">
            {doneTasks.map(task => (
              <TaskCard key={task.id} task={task} color={colorMap.green.value} width={cardWidth} />
            ))}
          </Stack>
        ) : (
          <Typography>No completed tasks</Typography>
        )}
      </TabPanel>

      {/* Trashed Tasks panel */}
      <TabPanel value={activeTab} index={2}>
        {trashedTasks.length > 0 ? (
          <Stack direction="row" gap={1} flexWrap="wrap">
            {trashedTasks.map(task => (
              <TaskCard key={task.id} task={task} color={colorMap.grey.value} width={cardWidth} />
            ))}
          </Stack>
        ) : (
          <Typography>No trashed tasks</Typography>
        )}
      </TabPanel>
    </PageContentLayout>
  );
}
