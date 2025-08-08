'use client';

import {
  Alert,
  Box,
  Button,
  Collapse,
  Divider,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

import { PageSection } from '@/core/components/PageSection';
import { ServiceStatusIcon } from '@/legacy/components/ServiceStatusIcon';
import { useDashboardViewState } from '@/legacy/hooks/useDashboardViewState';

export default function AccountPage() {
  const { severity, message, isLoading, canSignIn, canSignOut, handleSignIn, handleSignOut } =
    useDashboardViewState();

  return (
    <PageSection title="Account" description="Manage your account settings">
      {/* Top loading indicator */}
      <Collapse in={isLoading} unmountOnExit>
        <LinearProgress sx={{ mb: 2 }} />
      </Collapse>

      {/* Status message */}
      <Collapse in={Boolean(message)} unmountOnExit>
        <Alert severity={severity} sx={{ mb: 2 }}>
          {message}
        </Alert>
      </Collapse>

      <Grid container spacing={2}>
        {/* Auth actions */}
        <Grid size={{ mobileSm: 12, tabletSm: 6 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={1.5}>
              <Typography variant="h6" component="div">
                Authentication
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in to synchronize your data and access connected services
              </Typography>

              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  onClick={handleSignIn}
                  disabled={!canSignIn || isLoading}
                  aria-label="Sign in"
                >
                  Sign in
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleSignOut}
                  disabled={!canSignOut || isLoading}
                  aria-label="Sign out"
                >
                  Sign out
                </Button>
              </Stack>

              <Divider />

              <Box>
                <Typography variant="caption" color="text.secondary" component="div">
                  Tip
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  You can sign out safely at any time. Unsynced changes remain on this device until
                  you sign in again
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Connection status */}
        <Grid size={{ mobileSm: 12, tabletSm: 6 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={1.5}>
              <Typography variant="h6" component="div">
                Connection status
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Current health of core integrations
              </Typography>

              <List dense disablePadding>
                <ListItem secondaryAction={<ServiceStatusIcon service="google" />} sx={{ px: 0 }}>
                  <ListItemText
                    primary={<Typography variant="body2">Google Calendar</Typography>}
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        Events sync and reminders
                      </Typography>
                    }
                    slotProps={{
                      primary: { component: 'div' },
                      secondary: { component: 'div' },
                    }}
                  />
                </ListItem>

                <Divider component="li" />

                <ListItem secondaryAction={<ServiceStatusIcon service="supabase" />} sx={{ px: 0 }}>
                  <ListItemText
                    primary={<Typography variant="body2">Supabase</Typography>}
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        Auth, storage, and realtime updates
                      </Typography>
                    }
                    slotProps={{
                      primary: { component: 'div' },
                      secondary: { component: 'div' },
                    }}
                  />
                </ListItem>
              </List>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </PageSection>
  );
}
