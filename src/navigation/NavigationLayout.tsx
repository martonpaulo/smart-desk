'use client';

import { ReactNode } from 'react';

import { Box } from '@mui/material';

import { useResponsiveness } from '@/hooks/useResponsiveness';
import { BottomNav } from '@/navigation/BottomNav';
import { SideDrawer } from '@/navigation/SideDrawer';

interface NavigationLayoutProps {
  children: ReactNode;
}

export function NavigationLayout({ children }: NavigationLayoutProps) {
  const { isMobile } = useResponsiveness();

  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
      {!isMobile && <SideDrawer />}
      <Box component="main" sx={{ flexGrow: 1, pb: isMobile ? 7 : 0 }}>
        {children}
      </Box>
      {isMobile && <BottomNav />}
    </Box>
  );
}
