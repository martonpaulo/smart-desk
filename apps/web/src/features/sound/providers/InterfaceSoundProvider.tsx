import { ReactNode } from 'react';
import { SoundProvider } from 'react-sounds';

import { interfaceSounds } from 'src/features/sound/constants/interfaceSounds';

interface SoundProviderProps {
  children: ReactNode;
}

export function InterfaceSoundProvider({ children }: SoundProviderProps) {
  const preloadSounds = Object.values(interfaceSounds).map(sound => sound.id);

  return (
    <SoundProvider preload={preloadSounds} initialEnabled={true}>
      {children}
    </SoundProvider>
  );
}
