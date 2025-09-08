'use client';

import CloudDoneOutlinedIcon from '@mui/icons-material/CloudDoneOutlined';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SyncIcon from '@mui/icons-material/Sync';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { SxProps } from '@mui/material';
import { keyframes } from '@mui/system';
import { useConnectivityStore } from 'src/core/store/useConnectivityStore';

type Props = {
  iconSx?: SxProps;
};

const spin = keyframes({
  from: { transform: 'rotate(0deg)' },
  to: { transform: 'rotate(360deg)' },
});

export function SyncStatusIcon({ iconSx }: Props) {
  // Only select primitives. No invoked helpers here.
  const uiIcon = useConnectivityStore(s => s.uiIcon);
  const uiColor = useConnectivityStore(s => s.uiColor);
  const uiText = useConnectivityStore(s => s.uiText);
  const syncPhase = useConnectivityStore(s => s.syncPhase);

  const IconComp =
    uiIcon === 'cloudOff'
      ? CloudOffIcon
      : uiIcon === 'cloudDone'
        ? CloudDoneOutlinedIcon
        : uiIcon === 'cloudError'
          ? ErrorOutlineIcon
          : uiIcon === 'cloudWarning'
            ? WarningAmberIcon
            : uiIcon === 'sync'
              ? SyncIcon
              : CloudSyncIcon;

  return (
    <IconComp
      role="img"
      aria-label={uiText}
      sx={{
        color: `${uiColor}.main`,
        animation: syncPhase === 'syncing' ? `${spin} 1s linear infinite` : 'none',
        ...iconSx,
      }}
    />
  );
}
