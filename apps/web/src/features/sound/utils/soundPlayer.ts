import { playSound } from 'react-sounds';

import { interfaceSounds } from 'src/features/sound/constants/interfaceSounds';
import { InterfaceSound } from 'src/features/sound/types/InterfaceSound';

export function playInterfaceSound(soundName: InterfaceSound, volume: number = 0.2) {
  playSound(interfaceSounds[soundName].id, { volume, loop: false });
}
