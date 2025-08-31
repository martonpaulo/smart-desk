'use client';

import { ReactNode, useEffect } from 'react';

import { useResponsiveness } from '@/shared/hooks/useResponsiveness';

type MobileMotionControllerProps = {
  children: ReactNode;
  force?: boolean; // when true, forces "mobile" regardless of breakpoint
};

export function MobileMotionController({ children, force }: MobileMotionControllerProps) {
  const isMobile = useResponsiveness();

  useEffect(() => {
    const root = document.documentElement;
    const enable = force ?? isMobile;

    // Motion preference you already had
    root.setAttribute('data-mobile-motion', enable ? 'reduced' : 'normal');

    // hard mobile flag to scope theme overrides
    if (enable) root.setAttribute('data-mobile', 'true');
    else root.removeAttribute('data-mobile');

    return () => {
      root.removeAttribute('data-mobile-motion');
      root.removeAttribute('data-mobile');
    };
  }, [force, isMobile]);

  return <>{children}</>;
}
