'use client';

import { ReactNode } from 'react';

import { Box, Stack } from '@mui/material';

import { BottomNav } from '@/legacy/navigation/BottomNav';
import { SideDrawer } from '@/legacy/navigation/SideDrawer';
import { useResponsiveness } from '@/shared/hooks/useResponsiveness';

interface NavigationLayoutProps {
  children: ReactNode;
}

export function NavigationLayout({ children }: NavigationLayoutProps) {
  const isMobile = useResponsiveness();

  return (
    <Box display="flex" width="100%">
      {!isMobile && <SideDrawer />}

      <Box component="main" flexGrow={1} mb={isMobile ? 18 : 0} px={4} py={2}>
        <Stack spacing={2}>{children}</Stack>
      </Box>

      {isMobile && <BottomNav />}
    </Box>
  );
}
