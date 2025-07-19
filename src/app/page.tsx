'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { useResponsiveness } from '@/hooks/useResponsiveness';

export default function RootRedirect() {
  const { isMobile } = useResponsiveness();
  const router = useRouter();

  useEffect(() => {
    const dest = isMobile ? '/tasks' : '/board';
    router.replace(dest);
  }, [isMobile, router]);

  return null;
}
