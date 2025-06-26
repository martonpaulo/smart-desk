import { create } from 'zustand';

interface AudioState {
  isFirstRender: boolean;
  audioEnabled: boolean;
  toggleAudioEnabled: () => void;
  meetingAlertEnabled: boolean;
  toggleMeetingAlertEnabled: () => void;
  eventChangesAlertEnabled: boolean;
  toggleEventChangesAlertEnabled: () => void;
}

export const useAudioStore = create<AudioState>(set => ({
  isFirstRender: true,
  audioEnabled: false,
  toggleAudioEnabled: () =>
    set(state => ({ audioEnabled: !state.audioEnabled, isFirstRender: false })),
  meetingAlertEnabled: false,
  toggleMeetingAlertEnabled: () =>
    set(state => ({ meetingAlertEnabled: !state.meetingAlertEnabled })),
  eventChangesAlertEnabled: false,
  toggleEventChangesAlertEnabled: () =>
    set(state => ({ eventChangesAlertEnabled: !state.eventChangesAlertEnabled })),
}));
