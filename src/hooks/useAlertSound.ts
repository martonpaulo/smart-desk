import { IAlertType } from '@/types/IAlertType';

const alertSoundMap: Record<IAlertType, string> = {
  [IAlertType.UPCOMING]: '/sounds/upcoming.mp3',
  [IAlertType.UPDATE]: '/sounds/update.mp3',
};

export function useAlertSound(alertType: IAlertType) {
  const sound = alertSoundMap[alertType];

  const playAlert = () => {
    const audio = new Audio(sound);
    audio.play();
  };

  return { playAlert };
}
