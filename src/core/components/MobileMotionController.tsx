'use client';

import { ReactNode, useEffect } from 'react';

import { useResponsiveness } from '@/shared/hooks/useResponsiveness';

type MobileMotionControllerProps = {
  children: ReactNode;
  force?: boolean;
};

export function MobileMotionController({ children, force }: MobileMotionControllerProps) {
  const isMobile = useResponsiveness();

  useEffect(() => {
    const el = document.documentElement;
    const enable = force ?? isMobile;
    el.setAttribute('data-mobile-motion', enable ? 'reduced' : 'normal');
    return () => el.removeAttribute('data-mobile-motion');
  }, [force, isMobile]);

  return <>{children}</>;
}
