'use client';

import { useEffect, useMemo, useState } from 'react';

import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import {
  BottomNavigation,
  BottomNavigationAction,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  SwipeableDrawer,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';

import { routes } from '@/legacy/navigation/routes';

export function BottomNav() {
  const theme = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  // Responsive cap: fewer items on very small screens
  const isTabletUp = useMediaQuery(theme.breakpoints.up('mobileLg'));
  const isPhoneMdUp = useMediaQuery(theme.breakpoints.up('mobileSm'));
  const maxVisible = useMemo(() => {
    if (isTabletUp) return 6; // roomy
    if (isPhoneMdUp) return 5; // typical phones
    return 4; // very small phones
  }, [isPhoneMdUp, isTabletUp]);

  // Only mobile-approved routes
  const mobileRoutes = useMemo(
    () => [...routes.primary, ...routes.secondary].filter(r => r.showOnMobile),
    [],
  );

  // Split into visible + overflow
  const visible = mobileRoutes.slice(0, maxVisible);
  const overflow = mobileRoutes.slice(maxVisible);

  // Drawer state for overflow
  const [moreOpen, setMoreOpen] = useState(false);
  const toggleMore = (open: boolean) => () => setMoreOpen(open);

  const handleChange = (_: React.SyntheticEvent, newValue: string) => {
    if (newValue === '__more__') {
      setMoreOpen(true);
      return;
    }
    router.push(newValue);
  };

  // Prefetch all targets
  useEffect(() => {
    [...visible, ...overflow].forEach(route => {
      try {
        router.prefetch(route.href);
      } catch {
        // ignore
      }
    });
  }, [router, visible, overflow]);

  // For controlled BottomNavigation, keep the current path
  const navValue = useMemo(() => {
    // match by startsWith to handle nested paths
    const match = [...visible, ...overflow].find(r => pathname.startsWith(r.href));
    return match?.href ?? pathname;
  }, [pathname, visible, overflow]);

  return (
    <>
      <Paper
        elevation={3}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          // respect iOS safe area
          pb: 'calc(env(safe-area-inset-bottom, 0px))',
        }}
      >
        <BottomNavigation
          value={navValue}
          onChange={handleChange}
          // show label only for the selected action to save space
          sx={{
            px: 0.5,
            '& .MuiBottomNavigationAction-root': { minWidth: 0, px: 0.5 },
          }}
        >
          {visible.map(route => (
            <BottomNavigationAction
              key={route.href}
              value={route.href}
              icon={route.icon}
              label={route.label}
              showLabel
              aria-label={route.label}
            />
          ))}

          {overflow.length > 0 && (
            <BottomNavigationAction
              key="more"
              value="__more__"
              icon={<MoreHorizIcon />}
              label="More"
              showLabel
              aria-label="More"
            />
          )}
        </BottomNavigation>
      </Paper>

      {/* Overflow items drawer */}
      <SwipeableDrawer
        anchor="bottom"
        open={moreOpen}
        onOpen={toggleMore(true)}
        onClose={toggleMore(false)}
        disableDiscovery
        slotProps={{
          paper: {
            sx: {
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              pb: 'calc(env(safe-area-inset-bottom, 0px))',
            },
          },
        }}
      >
        <Typography variant="subtitle2" sx={{ px: 2, pt: 2, pb: 1.5 }} color="text.secondary">
          More
        </Typography>
        <Divider />
        <List dense disablePadding>
          {overflow.map(route => (
            <ListItemButton
              key={route.href}
              onClick={() => {
                setMoreOpen(false);
                router.push(route.href);
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>{route.icon}</ListItemIcon>
              <ListItemText primary={route.label} slotProps={{ primary: { variant: 'body2' } }} />
            </ListItemButton>
          ))}
        </List>
      </SwipeableDrawer>
    </>
  );
}
