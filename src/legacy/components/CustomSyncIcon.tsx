import CloudOffIcon from '@mui/icons-material/CloudOff';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SyncIcon from '@mui/icons-material/Sync';
import { SvgIconProps } from '@mui/material';

import { useAnimationDelay } from 'src/legacy/hooks/useAnimationDelay';
import { useSyncStatusStore } from 'src/legacy/store/syncStatus';

interface CustomSyncIconProps extends SvgIconProps {
  isSynced: boolean;
}

const iconMap = {
  syncing: { Icon: SyncIcon, spin: true },
  disconnected: { Icon: CloudOffIcon, spin: false },
  error: { Icon: ErrorOutlineIcon, spin: false },
};

export function CustomSyncIcon({ isSynced, ...props }: CustomSyncIconProps) {
  const animationDelay = useAnimationDelay();
  const syncStatus = useSyncStatusStore(s => s.status);

  if (isSynced) {
    return null; // Don't show icon if note is synced
  }

  const { color = 'action' } = props;
  const { Icon, spin } = iconMap[syncStatus as keyof typeof iconMap] || iconMap.syncing;

  return (
    <Icon
      color={color}
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
