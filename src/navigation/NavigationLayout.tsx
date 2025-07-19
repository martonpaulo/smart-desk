'use client';

import { ReactNode } from 'react';

import { Box, Stack } from '@mui/material';

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
      <Box component="main" sx={{ flexGrow: 1, mb: isMobile ? 8 : 0, px: 4, py: 2 }}>
        <Stack spacing={2}>{children}</Stack>
      </Box>
      {isMobile && <BottomNav />}
    </Box>
  );
}
