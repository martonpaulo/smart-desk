import { ReactNode, useRef, useState } from 'react';

import { IconButton, Stack, StackProps, Tooltip, useTheme } from '@mui/material';

import { InterfaceSound } from '@/features/sound/types/InterfaceSound';
import { useBoardStore } from '@/legacy/store/board/store';
import { Task } from '@/legacy/types/task';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { usePromiseFeedback } from '@/shared/context/PromiseFeedbackContext';

interface TaskActionButtonProps extends StackProps {
  icon: ReactNode;
  task: Task;
  dense?: boolean;
  tooltip: string;
  onAction: () => Promise<void> | void;
  successSound?: InterfaceSound;
  confirmTitle?: string;
  confirmContent?: string;
  successMessage?: string;
  errorMessage?: string;
  feedbackKey: string;
}

export function TaskActionButton({
  icon,
  task,
  dense = false,
  tooltip,
  onAction,
  successSound,
  confirmTitle = 'Are you sure?',
  confirmContent,
  successMessage = 'Action completed successfully',
  errorMessage = 'Failed to perform action',
  feedbackKey,
  ...stackProps
}: TaskActionButtonProps) {
  const theme = useTheme();
  const { runWithFeedback, isLoading } = usePromiseFeedback();
  const updateTask = useBoardStore(s => s.updateTask);

  const preActionSnapshotRef = useRef<Task | null>(null);
  const [openConfirm, setOpenConfirm] = useState(false);

  const handleOpenConfirm = () => {
    preActionSnapshotRef.current = structuredClone(task);
    setOpenConfirm(true);
  };

  const undoFromSnapshot = async () => {
    const snapshot = preActionSnapshotRef.current;
    if (!snapshot) return;
    await updateTask({ ...snapshot });
  };

  const handleConfirm = async () => {
    await runWithFeedback<void>({
      key: feedbackKey,
      operation: () => Promise.resolve(onAction()),
      successSound,
      successMessage,
      errorMessage,
      onUndo: undoFromSnapshot,
    });
    setOpenConfirm(false);
  };

  const loading = isLoading(feedbackKey);

  const button = (
    <IconButton
      onClick={handleOpenConfirm}
      size="small"
      sx={{ padding: 0.5, borderRadius: theme.shape.borderRadiusSmall }}
      disabled={loading}
      aria-label={tooltip}
    >
      {icon}
    </IconButton>
  );

  return (
    <>
      <Stack {...stackProps}>{dense ? button : <Tooltip title={tooltip}>{button}</Tooltip>}</Stack>

      <ConfirmDialog
        open={openConfirm}
        title={confirmTitle}
        content={confirmContent}
        onCancel={() => setOpenConfirm(false)}
        onConfirm={handleConfirm}
        loading={loading}
      />
    </>
  );
}
