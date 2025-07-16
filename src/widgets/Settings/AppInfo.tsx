import { Stack, TextField, Typography } from '@mui/material';

import { RESET_TIME } from '@/utils/resetTime';

export function AppInfo() {
  return (
    <Stack spacing={3} px={2}>
      <Stack spacing={1}>
        <Typography variant="h3">Reset Time</Typography>
        <Stack direction="row" alignItems="center" gap={1}>
          <Typography variant="body2">Daily tasks reset at </Typography>
          <TextField type="time" size="small" variant="standard" value={RESET_TIME} />
        </Stack>
      </Stack>

      <Stack spacing={1}>
        <Typography variant="h3">Version</Typography>
        <Typography variant="body2">{process.env.NEXT_PUBLIC_APP_VERSION}</Typography>
      </Stack>
    </Stack>
  );
}
