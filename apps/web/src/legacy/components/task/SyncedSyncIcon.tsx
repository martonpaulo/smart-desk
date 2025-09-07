'use client';

import CloudOffIcon from '@mui/icons-material/CloudOff';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SyncIcon from '@mui/icons-material/Sync';
import { SvgIconProps } from '@mui/material';
import { useAnimationDelay } from 'src/legacy/hooks/useAnimationDelay';

export type SyncStatus = 'syncing' | 'disconnected' | 'error';

type SyncedSyncIconProps = SvgIconProps & {
  status?: SyncStatus;
};

const iconMap = {
  syncing: { Icon: SyncIcon, spin: true },
  disconnected: { Icon: CloudOffIcon, spin: false },
  error: { Icon: ErrorOutlineIcon, spin: false },
} satisfies Record<SyncStatus, { Icon: React.ComponentType<SvgIconProps>; spin: boolean }>;

export function SyncedSyncIcon({ status = 'syncing', ...props }: SyncedSyncIconProps) {
  const animationDelay = useAnimationDelay();
  const map = iconMap[status] ?? iconMap.syncing;
  const { Icon, spin } = map;

  return (
    <Icon
      {...props}
      sx={[
        ...(props.sx ? (Array.isArray(props.sx) ? props.sx : [props.sx]) : []),
        ...(spin
          ? [
              {
                animation: 'spin 1s linear infinite',
                animationDelay,
                '@keyframes spin': {
                  '0%': { transform: 'rotate(360deg)' },
                  '100%': { transform: 'rotate(0deg)' },
                },
              },
            ]
          : []),
      ]}
    />
  );
}
