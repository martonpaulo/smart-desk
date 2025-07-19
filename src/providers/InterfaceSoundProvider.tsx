import { ReactNode } from 'react';
import { SoundProvider } from 'react-sounds';

import { sounds } from '@/config/sounds';

interface SoundProviderProps {
  children: ReactNode;
}

export function InterfaceSoundProvider({ children }: SoundProviderProps) {
  const preloadSounds = Object.values(sounds).map(sound => sound.id);

  return (
    <SoundProvider preload={preloadSounds} initialEnabled={true}>
      {children}
    </SoundProvider>
  );
}
