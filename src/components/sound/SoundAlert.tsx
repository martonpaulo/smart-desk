import { useEffect, useState } from 'react';

import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';

import { IntervalSelector } from '@/components/sound/IntervalSelector';
import { useSpeech } from '@/hooks/useSpeech';
import { useTimeAnnouncement } from '@/hooks/useTimeAnnouncement';
import type { Event } from '@/types/Event';
import { buildAnnouncement } from '@/utils/announcementUtils';

interface SoundAlertProps {
  currentTime: Date;
  events: Event[];
  onAudioToggle: () => void;
  isAudioOn: boolean;
  isFirstRender: boolean;
  isMeetingStartingAlertEnabled: boolean;
  onMeetingStartingAlertToggle: () => void;
  isEventChangesAlertEnabled: boolean;
  onEventChangesAlertToggle: () => void;
}

const DEFAULT_ANNOUNCEMENT_INTERVAL = 60; // in minutes

export function SoundAlert({
  currentTime,
  events,
  onAudioToggle,
  isAudioOn,
  isFirstRender,
  isMeetingStartingAlertEnabled,
  onMeetingStartingAlertToggle,
  isEventChangesAlertEnabled,
  onEventChangesAlertToggle,
}: SoundAlertProps) {
  const [isAnnouncementEnabled, setAnnouncementEnabled] = useState(false);
  const [allowDuringMeetings, setAllowDuringMeetings] = useState(false);
  const [announcementInterval, setAnnouncementInterval] = useState(DEFAULT_ANNOUNCEMENT_INTERVAL);
  const [isEditingInterval, setEditingInterval] = useState(false);

  useEffect(() => {
    if (!isAudioOn) setEditingInterval(false);
  }, [isAudioOn]);

  const handleEnableAudio = () => {
    if (isFirstRender) {
      const utterance = new SpeechSynthesisUtterance('');
      window.speechSynthesis.speak(utterance);
    }
    onAudioToggle();
  };

  const handleIntervalCheckboxChange = () => {
    if (!isEditingInterval) setAnnouncementEnabled(enabled => !enabled);
  };

  const handleEditIntervalStart = () => {
    setEditingInterval(true);
  };

  const handleIntervalEditChange = (newInterval: number) => {
    setAnnouncementInterval(newInterval);
    setEditingInterval(false);
  };

  const handleDuringMeetingsChange = () => {
    setAllowDuringMeetings(prev => !prev);
  };

  const handleMeetingStartingChange = () => {
    onMeetingStartingAlertToggle();
  };

  const handleEventChangesAlertChange = () => {
    onEventChangesAlertToggle();
  };

  const announcementText = buildAnnouncement(currentTime);
  const { startSpeech, speechStatus, isInQueue } = useSpeech(announcementText);

  useTimeAnnouncement({
    now: currentTime,
    events,
    audioEnabled: isAudioOn && isAnnouncementEnabled,
    includeMeetings: isAnnouncementEnabled && allowDuringMeetings,
    intervalMinutes: announcementInterval,
    startSpeech,
    speechStatus,
    isInQueue,
  });

  return (
    <Stack>
      <Box display="flex" alignItems="center" gap={0.5}>
        <Typography variant="h3">Sound alerts</Typography>
        <IconButton onClick={handleEnableAudio}>
          {isAudioOn ? <VolumeUpIcon /> : <VolumeOffIcon />}
        </IconButton>
      </Box>

      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={isMeetingStartingAlertEnabled}
              onChange={handleMeetingStartingChange}
              disabled={!isAudioOn}
            />
          }
          label="upcoming meeting"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={isEventChangesAlertEnabled}
              onChange={handleEventChangesAlertChange}
              disabled={!isAudioOn}
            />
          }
          label="event changes"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={isAnnouncementEnabled}
              onChange={handleIntervalCheckboxChange}
              disabled={!isAudioOn}
            />
          }
          label={
            <IntervalSelector
              interval={announcementInterval}
              isEditing={isEditingInterval}
              onEditStart={handleEditIntervalStart}
              onIntervalChange={handleIntervalEditChange}
              disabled={!isAudioOn || !isAnnouncementEnabled}
              canEdit={isAudioOn && !isEditingInterval}
            />
          }
        />

        <FormGroup sx={{ pl: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={allowDuringMeetings}
                onChange={handleDuringMeetingsChange}
                disabled={!isAudioOn || !isAnnouncementEnabled}
              />
            }
            label="allow during meetings"
          />
        </FormGroup>
      </FormGroup>
    </Stack>
  );
}
