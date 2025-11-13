'use client';

import { ReactNode, useEffect } from 'react';

import { useUiPrefsStore } from 'src/legacy/store/uiPrefsStore';

interface ZoomProviderProps {
  children: ReactNode;
}

export function ZoomProvider({ children }: ZoomProviderProps) {
  const zoom = useUiPrefsStore(state => state.zoom);

  useEffect(() => {
    document.body.style.zoom = String(zoom);
  }, [zoom]);

  return <>{children}</>;
}
