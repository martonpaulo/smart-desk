import { create } from 'zustand';

interface AudioState {
  isFirstRender: boolean;
  audioEnabled: boolean;
  toggleAudioEnabled: () => void;
  meetingAlertEnabled: boolean;
  toggleMeetingAlertEnabled: () => void;
  eventChangesAlertEnabled: boolean;
  toggleEventChangesAlertEnabled: () => void;
  registerAudio: (audio: HTMLAudioElement) => void;
  stopAll: () => void;
  audios: Set<HTMLAudioElement>;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  isFirstRender: true,
  audioEnabled: false,
  toggleAudioEnabled: () =>
    set(state => {
      const next = !state.audioEnabled;
      if (!next) get().stopAll();
      return { audioEnabled: next, isFirstRender: false };
    }),
  meetingAlertEnabled: false,
  toggleMeetingAlertEnabled: () =>
    set(state => ({ meetingAlertEnabled: !state.meetingAlertEnabled })),
  eventChangesAlertEnabled: false,
  toggleEventChangesAlertEnabled: () =>
    set(state => ({ eventChangesAlertEnabled: !state.eventChangesAlertEnabled })),
  registerAudio: audio => {
    const audios = get().audios;
    audios.add(audio);
    audio.onended = () => {
      audios.delete(audio);
    };
  },
  stopAll: () => {
    const audios = get().audios;
    audios.forEach(a => {
      a.pause();
      a.currentTime = 0;
    });
    audios.clear();
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* no-op */
    }
  },
  audios: new Set<HTMLAudioElement>(),
}));
