import { useAudioStore } from 'src/legacy/store/audioStore';
import { IAlertType } from 'src/legacy/types/IAlertType';

const alertSoundMap: Record<IAlertType, string> = {
  [IAlertType.UPCOMING]: '/sounds/upcoming.mp3',
  [IAlertType.UPDATE]: '/sounds/update.mp3',
};

export function useAlertSound(alertType: IAlertType) {
  const sound = alertSoundMap[alertType];
  const audioEnabled = useAudioStore(state => state.audioEnabled);
  const register = useAudioStore(state => state.registerAudio);

  const playAlert = () => {
    if (!audioEnabled) return;
    const audio = new Audio(sound);
    register(audio);
    audio.play();
  };

  return { playAlert };
}
