'use client';

import { useSoundEnabled } from 'react-sounds';

import { Button, Checkbox, Stack, TextField, Typography } from '@mui/material';
import { DateTime } from 'luxon';

import { PageContentLayout } from '@/components/PageContentLayout';
import { ResetZoomButton } from '@/components/ResetZoomButton';
import { ServiceStatusIcon } from '@/components/ServiceStatusIcon';
import { ZoomSelector } from '@/components/ZoomSelector';
import { useAudioStore } from '@/store/audioStore';
import { useEventStore } from '@/store/eventStore';
import { useTodoPrefsStore } from '@/store/todoPrefsStore';
import { RESET_TIME } from '@/utils/resetTime';
import { playInterfaceSound } from '@/utils/soundPlayer';
import { SoundAlert } from '@/widgets/SoundAlert';

export default function SettingsPage() {
  const [enabled, setEnabled] = useSoundEnabled();

  const hideDoneColumn = useTodoPrefsStore(state => state.hideDoneColumn);
  const setHideDoneColumn = useTodoPrefsStore(state => state.setHideDoneColumn);

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
    <PageContentLayout title="Settings" description="Configure your app preferences">
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
    </PageContentLayout>
  );
}
