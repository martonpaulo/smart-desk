'use client';

import {
  Box,
  Button,
  Divider,
  FormControlLabel,
  Grid,
  Paper,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { DateTime } from 'luxon';
import { useSoundEnabled } from 'react-sounds';

import { PageSection } from 'src/core/components/PageSection';
import { playInterfaceSound } from 'src/features/sound/utils/soundPlayer';
import { ResetZoomButton } from 'src/legacy/components/ResetZoomButton';
import { ZoomSelector } from 'src/legacy/components/ZoomSelector';
import { useAudioStore } from 'src/legacy/store/audioStore';
import { RESET_TIME } from 'src/legacy/utils/resetTime';

export default function SettingsPage() {
  const [enabled, setEnabled] = useSoundEnabled();

  // const { data: events } = useCombinedEvents();
  // const audioEnabled = useAudioStore(state => state.audioEnabled);
  // const toggleAudioEnabled = useAudioStore(state => state.toggleAudioEnabled);
  // const isFirstRender = useAudioStore(state => state.isFirstRender);
  const isMeetingAlertEnabled = useAudioStore(state => state.meetingAlertEnabled);
  const isEventChangesAlertEnabled = useAudioStore(state => state.eventChangesAlertEnabled);
  const toggleMeetingAlertEnabled = useAudioStore(state => state.toggleMeetingAlertEnabled);
  const toggleEventChangesAlertEnabled = useAudioStore(
    state => state.toggleEventChangesAlertEnabled,
  );

  const buildDate = process.env.NEXT_PUBLIC_APP_BUILD_DATE || undefined;
  const formattedBuildDate = buildDate
    ? DateTime.fromISO(buildDate).toLocaleString(DateTime.DATETIME_MED)
    : 'Unknown';

  const appVersion = process.env.NEXT_PUBLIC_APP_VERSION ?? 'Unknown';

  const handleEnableSounds = () => {
    setEnabled(!enabled);
    playInterfaceSound(!enabled ? 'toggleOn' : 'toggleOff');
  };

  return (
    <PageSection title="Settings" description="Configure your app preferences">
      {/* Smart alerts preview and global audio store toggles
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <SoundAlert
          currentTime={now}
          events={events}
          onAudioToggle={toggleAudioEnabled}
          isAudioOn={audioEnabled}
          isFirstRender={isFirstRender}
          isMeetingStartingAlertEnabled={isMeetingAlertEnabled}
          onMeetingStartingAlertToggle={toggleMeetingAlertEnabled}
          isEventChangesAlertEnabled={isEventChangesAlertEnabled}
          onEventChangesAlertToggle={toggleEventChangesAlertEnabled}
        />
      </Paper> */}

      <Grid container spacing={2}>
        {/* Version info */}
        <Grid size={{ mobileSm: 12, tabletSm: 6 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={1.5}>
              <Typography variant="h3" component="div">
                Version
              </Typography>

              <Box
                role="group"
                aria-label="Application build details"
                sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 1 }}
              >
                <Typography variant="body2" color="text.secondary">
                  Build ID
                </Typography>
                <Typography variant="body2">{appVersion}</Typography>

                <Typography variant="body2" color="text.secondary">
                  Build date
                </Typography>
                <Typography variant="body2">{formattedBuildDate}</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Zoom controls */}
        <Grid size={{ mobileSm: 12, tabletSm: 6 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={1.5} alignItems="flex-start">
              <Typography variant="h3" component="div">
                Interface zoom
              </Typography>

              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Set zoom level
                </Typography>
                <ZoomSelector />
                <ResetZoomButton>Reset</ResetZoomButton>
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        {/* Daily reset */}
        <Grid size={{ mobileSm: 12, tabletSm: 6 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={1.5} alignItems="flex-start">
              <Typography variant="h3" component="div">
                Daily reset
              </Typography>

              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Tasks reset at
                </Typography>
                <TextField
                  type="time"
                  size="small"
                  variant="standard"
                  value={RESET_TIME.toString()}
                  // If you plan to make it editable later, wire onChange here
                />
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        {/* Sound settings */}
        <Grid size={{ mobileSm: 12, tabletSm: 6 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={1.5} alignItems="flex-start">
              <Typography variant="h3" component="div">
                Sound
              </Typography>

              <FormControlLabel
                control={<Switch checked={enabled} onChange={handleEnableSounds} color="primary" />}
                label={<Typography variant="body2">Enable sounds</Typography>}
              />

              <Tooltip title="Play a short confirmation sound">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    playInterfaceSound('info');
                  }}
                >
                  Test sound
                </Button>
              </Tooltip>

              <Divider flexItem />

              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary" component="div">
                  Alerts
                </Typography>

                <FormControlLabel
                  control={
                    <Switch
                      checked={isMeetingAlertEnabled}
                      onChange={() => {
                        toggleMeetingAlertEnabled();
                        playInterfaceSound('toggleOn');
                      }}
                    />
                  }
                  label={<Typography variant="body2">Meeting starting</Typography>}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={isEventChangesAlertEnabled}
                      onChange={() => {
                        toggleEventChangesAlertEnabled();
                        playInterfaceSound('toggleOff');
                      }}
                    />
                  }
                  label={<Typography variant="body2">Event changes</Typography>}
                />
              </Stack>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </PageSection>
  );
}
