import CloudOffIcon from '@mui/icons-material/CloudOff';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SyncIcon from '@mui/icons-material/Sync';
import { SvgIconProps } from '@mui/material';

import { useAnimationDelay } from '@/legacy/hooks/useAnimationDelay';

interface SyncedSyncIconProps extends SvgIconProps {
  status?: string; // 'syncing' | 'disconnected' | 'error'
}

const iconMap = {
  syncing: { Icon: SyncIcon, spin: true },
  disconnected: { Icon: CloudOffIcon, spin: false },
  error: { Icon: ErrorOutlineIcon, spin: false },
};

export function SyncedSyncIcon({ status = 'syncing', ...props }: SyncedSyncIconProps) {
  const animationDelay = useAnimationDelay();

  const { Icon, spin } = iconMap[status as keyof typeof iconMap] || iconMap.syncing;

  return (
    <Icon
      {...props}
      sx={{
        ...props.sx,
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
