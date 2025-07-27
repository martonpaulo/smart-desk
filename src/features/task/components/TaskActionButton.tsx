import { ReactNode, useState } from 'react';

import { IconButton, Stack, StackProps, Tooltip, useTheme } from '@mui/material';
import { useSnackbar } from 'notistack';

import { InterfaceSound } from '@/features/sound/types/InterfaceSound';
import { playInterfaceSound } from '@/features/sound/utils/soundPlayer';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';

interface TaskActionButtonProps extends StackProps {
  icon: ReactNode;
  tooltip: string;
  onAction: () => Promise<void> | void;
  soundName?: InterfaceSound;
  confirmTitle?: string;
  confirmContent?: string;
  successMessage?: string;
  errorMessage?: string;
}

export function TaskActionButton({
  icon,
  tooltip,
  onAction,
  soundName,
  confirmTitle = 'Are you sure?',
  confirmContent,
  successMessage = 'Action completed successfully',
  errorMessage = 'Failed to perform action',
  ...stackProps
}: TaskActionButtonProps) {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();

  const [openConfirm, setOpenConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);

    try {
      await onAction();
      if (soundName) playInterfaceSound(soundName);
      enqueueSnackbar(successMessage, { variant: 'success' });
    } catch (err) {
      playInterfaceSound('error');
      console.error('TaskActionButton error', err);
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
      setOpenConfirm(false);
    }
  };

  return (
    <>
      <Stack {...stackProps}>
        <Tooltip title={tooltip}>
          <IconButton
            onClick={() => setOpenConfirm(true)}
            size="small"
            sx={{ padding: 0.5, borderRadius: theme.shape.borderRadiusSmall }}
          >
            {icon}
          </IconButton>
        </Tooltip>
      </Stack>

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
