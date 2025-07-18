'use client';

import { SyntheticEvent, useState } from 'react';

import { Box, Tab, Tabs } from '@mui/material';

import { useDashboardViewState } from '@/hooks/useDashboardViewState';
import { useAudioStore } from '@/store/audioStore';
import { AuthControl } from '@/widgets/AuthControl';
import { ICSCalendarManager } from '@/widgets/ICSCalendarManager';
import { LocalEventsManager } from '@/widgets/LocalEventsManager';
import { EventsTrash } from '@/widgets/Settings/EventsTrash';
import { GeneralSettings } from '@/widgets/Settings/GeneralSettings';
import { TagPresets } from '@/widgets/Settings/TagPresets';
import { SoundAlert } from '@/widgets/SoundAlert';

export default function SettingsPage() {
  const audioEnabled = useAudioStore(state => state.audioEnabled);
  const toggleAudioEnabled = useAudioStore(state => state.toggleAudioEnabled);
  const isFirstRender = useAudioStore(state => state.isFirstRender);
  const isMeetingAlertEnabled = useAudioStore(state => state.meetingAlertEnabled);
  const isEventChangesAlertEnabled = useAudioStore(state => state.eventChangesAlertEnabled);
  const toggleMeetingAlertEnabled = useAudioStore(state => state.toggleMeetingAlertEnabled);
  const toggleEventChangesAlertEnabled = useAudioStore(
    state => state.toggleEventChangesAlertEnabled,
  );

  const now = new Date();

  const {
    severity,
    message,
    isLoading,
    canSignIn,
    canSignOut,
    events,
    handleSignIn,
    handleSignOut,
  } = useDashboardViewState();

  const tabs = {
    General: <GeneralSettings />,
    'ICS Calendar': <ICSCalendarManager />,
    'Local Events': <LocalEventsManager />,
    'Deleted Events': <EventsTrash />,
    Tags: <TagPresets />,
    Auth: (
      <AuthControl
        severity={severity}
        message={message}
        isLoading={isLoading}
        canSignIn={canSignIn}
        canSignOut={canSignOut}
        handleSignIn={handleSignIn}
        handleSignOut={handleSignOut}
      />
    ),
    'Sound Alerts': events && (
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
    ),
  };

  const [tab, setTab] = useState(0);

  const handleTabChange = (_event: SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Tabs
        orientation="vertical"
        value={tab}
        onChange={handleTabChange}
        aria-label="settings tabs"
        sx={{ borderRight: 1, borderColor: 'divider', minWidth: '120px' }}
      >
        {Object.keys(tabs).map(key => (
          <Tab key={key} label={key} />
        ))}
      </Tabs>
      <Box
        sx={{
          flexGrow: 1,
          ml: 2,
          maxWidth: 'calc(100% - 144px)',
          minHeight: '65vh',
          maxHeight: '65vh',
        }}
      >
        {Object.values(tabs).map((content, index) => (
          <Box key={index} hidden={tab !== index}>
            {content}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
