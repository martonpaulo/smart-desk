import { playSound } from 'react-sounds';

import { interfaceSounds } from '@/features/sound/config/interfaceSounds';
import { InterfaceSound } from '@/features/sound/types/InterfaceSound';

export function playInterfaceSound(soundName: InterfaceSound, volume: number = 0.2) {
  playSound(interfaceSounds[soundName].id, { volume, loop: false });
}
