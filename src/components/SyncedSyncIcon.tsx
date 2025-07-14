import CloudOffIcon from '@mui/icons-material/CloudOff';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SyncIcon from '@mui/icons-material/Sync';
import { Box } from '@mui/material';

import { useAnimationDelay } from '@/hooks/useAnimationDelay';

interface SyncedSyncIconProps {
  status?: string; // 'syncing' | 'disconnected' | 'error'
}

const iconMap = {
  syncing: { Icon: SyncIcon, spin: true },
  disconnected: { Icon: CloudOffIcon, spin: false },
  error: { Icon: ErrorOutlineIcon, spin: false },
};

export function SyncedSyncIcon({ status = 'syncing' }: SyncedSyncIconProps) {
  const animationDelay = useAnimationDelay();

  const { Icon, spin } = iconMap[status as keyof typeof iconMap] || iconMap.syncing;

  return (
    <Box
      component={Icon}
      fontSize="inherit"
      sx={{
        color: 'text.secondary',
        alignSelf: 'center',
        fontSize: '0.8rem',
        ...(spin && {
          animation: 'spin 1s linear infinite',
          animationDelay,
          '@keyframes spin': {
            '0%': { transform: 'rotate(360deg)' },
            '100%': { transform: 'rotate(0deg)' },
          },
        }),
      }}
    />
  );
}
