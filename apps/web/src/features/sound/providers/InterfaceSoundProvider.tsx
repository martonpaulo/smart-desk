import React from 'react';
import { SoundProvider } from 'react-sounds';

import { interfaceSounds } from 'src/features/sound/constants/interfaceSounds';

interface SoundProviderProps {
  children: React.ReactNode;
}

export function InterfaceSoundProvider({ children }: SoundProviderProps) {
  const preloadSounds = Object.values(interfaceSounds).map(sound => sound.id);

  return React.createElement(
    SoundProvider as React.ComponentType<SoundProviderProps>,
    { preload: preloadSounds, initialEnabled: true },
    children
  );
}
