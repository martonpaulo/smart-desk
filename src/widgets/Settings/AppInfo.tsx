import { Typography } from '@mui/material';

export function AppInfo() {
  return <Typography>Version: {process.env.NEXT_PUBLIC_APP_VERSION}</Typography>;
}
