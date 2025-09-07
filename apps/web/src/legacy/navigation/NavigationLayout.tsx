'use client';

import { ReactNode } from 'react';

import { Box, Stack } from '@mui/material';
import { BottomNav } from 'src/legacy/navigation/BottomNav';
import { SideDrawer } from 'src/legacy/navigation/SideDrawer';
import { useResponsiveness } from 'src/shared/hooks/useResponsiveness';

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
