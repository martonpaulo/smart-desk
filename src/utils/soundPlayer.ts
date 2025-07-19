import { playSound } from 'react-sounds';

import { sounds } from '@/config/sounds';
import { InterfaceSound } from '@/types/interfaceSound';

export function playInterfaceSound(soundName: InterfaceSound, volume: number = 0.2) {
  playSound(sounds[soundName].id, { volume, loop: false });
}
