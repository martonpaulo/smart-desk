'use client';

import { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';

import { Box } from '@mui/material';

import { useResponsiveness } from '@/hooks/useResponsiveness';
import { BottomNav } from '@/navigation/BottomNav';
import { SideDrawer } from '@/navigation/SideDrawer';

interface NavigationLayoutProps {
  readonly children?: ReactNode;
}

export function NavigationLayout(_: NavigationLayoutProps) {
  const { isMobile } = useResponsiveness();

  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
      {!isMobile && <SideDrawer />}
      <Box component="main" sx={{ flexGrow: 1, pb: isMobile ? 7 : 0 }}>
        <Outlet />
      </Box>
      {isMobile && <BottomNav />}
    </Box>
  );
}
