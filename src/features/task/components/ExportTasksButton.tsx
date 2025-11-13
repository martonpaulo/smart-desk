import { Download } from '@mui/icons-material';
import { Button, SxProps, Theme } from '@mui/material';
import { enqueueSnackbar } from 'notistack';

import { exportTasksToCsv } from 'src/features/task/utils/exportTasksToCsv';
import { useBoardStore } from 'src/legacy/store/board/store';

interface ExportTasksButtonProps {
  /**
   * Whether to show only non-trashed tasks
   * @default true
   */
  excludeTrashed?: boolean;

  /**
   * Custom filename for the exported CSV
   * @default auto-generated with current date
   */
  filename?: string;

  /**
   * Button variant
   * @default 'outlined'
   */
  variant?: 'text' | 'outlined' | 'contained';

  /**
   * Button size
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Whether to show tooltip
   * @default true
   */
  showTooltip?: boolean;

  /**
   * Custom tooltip text
   * @default 'Export tasks to CSV'
   */
  tooltipText?: string;

  /**
   * Custom styles for the button
   */
  sx?: SxProps<Theme>;
}

/**
 * Button component for exporting tasks to CSV format
 * Filters out trashed tasks by default and provides a clean export
 */
export function ExportTasksButton({
  excludeTrashed = true,
  filename,
  variant = 'outlined',
  size = 'medium',
  tooltipText = 'Export tasks to CSV',
  sx,
}: ExportTasksButtonProps) {
  const tasks = useBoardStore(state => state.tasks);

  const handleExport = () => {
    try {
      // Filter tasks based on trashed status
      const filteredTasks = excludeTrashed ? tasks.filter(task => !task.trashed) : tasks;

      if (filteredTasks.length === 0) {
        enqueueSnackbar('No tasks available to export', {
          variant: 'warning',
        });
        return;
      }

      // Show loading notification
      enqueueSnackbar('Preparing export...', {
        variant: 'info',
        autoHideDuration: 2000,
      });

      // Export tasks
      exportTasksToCsv(filteredTasks, filename);

      // Show success notification
      enqueueSnackbar(
        `Successfully exported ${filteredTasks.length} task${filteredTasks.length !== 1 ? 's' : ''}`,
        {
          variant: 'success',
          autoHideDuration: 4000,
        },
      );
    } catch (error) {
      console.error('Export failed:', error);
      enqueueSnackbar('Failed to export tasks. Please try again.', {
        variant: 'error',
        autoHideDuration: 5000,
      });
    }
  };

  const button = (
    <Button
      onClick={handleExport}
      variant={variant}
      size={size}
      startIcon={<Download />}
      disabled={tasks.length === 0}
      aria-label={tooltipText}
      sx={sx}
    >
      Export Tasks
    </Button>
  );

  return button;
}
