'use client';

import { useSoundEnabled } from 'react-sounds';

import { Button, Checkbox, Stack, TextField, Typography } from '@mui/material';
import { DateTime } from 'luxon';

import { PageSection } from '@/core/components/PageSection';
import { playInterfaceSound } from '@/features/sound/utils/soundPlayer';
import { ResetZoomButton } from '@/legacy/components/ResetZoomButton';
import { SoundAlert } from '@/legacy/components/sound/SoundAlert';
import { ZoomSelector } from '@/legacy/components/ZoomSelector';
import { useAudioStore } from '@/legacy/store/audioStore';
import { useEventStore } from '@/legacy/store/eventStore';
import { RESET_TIME } from '@/legacy/utils/resetTime';

export default function SettingsPage() {
  const [enabled, setEnabled] = useSoundEnabled();

  const events = useEventStore(state => state.events);
  const audioEnabled = useAudioStore(state => state.audioEnabled);
  const toggleAudioEnabled = useAudioStore(state => state.toggleAudioEnabled);
  const isFirstRender = useAudioStore(state => state.isFirstRender);
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

  const now = new Date();

  return (
    <PageSection title="Settings" description="Configure your app preferences">
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

      <Stack spacing={1} alignItems="flex-start">
        <Typography variant="h3">Sound Settings</Typography>
        <Stack direction="row" alignItems="center">
          <Checkbox checked={enabled} onChange={() => setEnabled(!enabled)} size="small" />
          <Typography variant="body2">Enable Sounds</Typography>
        </Stack>
        <Button variant="outlined" onClick={() => playInterfaceSound('info')}>
          Test Sound
        </Button>
      </Stack>

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
    </PageSection>
  );
}
