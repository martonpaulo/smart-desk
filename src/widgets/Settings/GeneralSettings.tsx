import { Checkbox, Stack, TextField, Typography } from '@mui/material';
import { DateTime } from 'luxon';

import { ResetZoomButton } from '@/components/ResetZoomButton';
import { ServiceStatusIcon } from '@/components/ServiceStatusIcon';
import { ZoomSelector } from '@/components/ZoomSelector';
import { useTodoPrefsStore } from '@/store/todoPrefsStore';
import { RESET_TIME } from '@/utils/resetTime';

export function GeneralSettings() {
  const hideDoneColumn = useTodoPrefsStore(state => state.hideDoneColumn);
  const setHideDoneColumn = useTodoPrefsStore(state => state.setHideDoneColumn);

  const buildDate = process.env.NEXT_PUBLIC_APP_BUILD_DATE || undefined;
  const formattedBuildDate = buildDate
    ? DateTime.fromISO(buildDate).toLocaleString(DateTime.DATETIME_MED)
    : 'Unknown';

  return (
    <Stack spacing={3} px={2}>
      <Stack spacing={1}>
        <Typography variant="h3">Board Preferences</Typography>
        <Stack direction="row" alignItems="center">
          <Checkbox
            checked={!hideDoneColumn}
            onChange={e => setHideDoneColumn(!e.target.checked)}
            size="small"
          />
          <Typography variant="body2">Display Done Column</Typography>
        </Stack>
      </Stack>

      <Stack spacing={1}>
        <Typography variant="h3">Interface zoom</Typography>
        <Stack direction="row" alignItems="center" gap={1}>
          <Typography variant="body2">Set zoom level</Typography>
          <ZoomSelector />
          <ResetZoomButton>Reset</ResetZoomButton>
        </Stack>
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="h3">Connection Status</Typography>

        <Stack direction="row" alignItems="center" gap={0.5}>
          <Typography variant="body2">Google Calendar</Typography>
          <ServiceStatusIcon service="google" />
        </Stack>
        <Stack direction="row" alignItems="center" gap={0.5}>
          <Typography variant="body2">Supabase</Typography>
          <ServiceStatusIcon service="supabase" />
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
