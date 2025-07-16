import { Stack, TextField, Typography } from '@mui/material';
import { DateTime } from 'luxon';

import { ResetZoomButton } from '@/components/ResetZoomButton';
import { ZoomSelector } from '@/components/ZoomSelector';
import { RESET_TIME } from '@/utils/resetTime';

export function AppInfo() {
  const buildDate = process.env.NEXT_PUBLIC_APP_BUILD_DATE || undefined;
  const formattedBuildDate = buildDate
    ? DateTime.fromISO(buildDate).toLocaleString(DateTime.DATETIME_MED)
    : 'Unknown';

  return (
    <Stack spacing={3} px={2}>
      <Stack spacing={1}>
        <Typography variant="h3">Interface zoom</Typography>
        <Stack direction="row" alignItems="center" gap={1}>
          <Typography variant="body2">Set zoom level</Typography>
          <ZoomSelector />
          <ResetZoomButton>Reset</ResetZoomButton>
        </Stack>
      </Stack>

      <Stack spacing={1}>
        <Typography variant="h3">Reset Time</Typography>
        <Stack direction="row" alignItems="center" gap={1}>
          <Typography variant="body2">Daily tasks reset at </Typography>
          <TextField type="time" size="small" variant="standard" value={RESET_TIME} />
        </Stack>
      </Stack>

      <Stack spacing={1}>
        <Typography variant="h3">Version</Typography>
        <Stack direction="row" alignItems="center" gap={1}>
          <Typography variant="body2">App Build ID</Typography>
          <Typography variant="body2">{process.env.NEXT_PUBLIC_APP_VERSION}</Typography>
        </Stack>
        <Stack direction="row" alignItems="center" gap={1}>
          <Typography variant="body2">App Build Date</Typography>
          <Typography variant="body2">{formattedBuildDate}</Typography>
        </Stack>
      </Stack>
    </Stack>
  );
}
