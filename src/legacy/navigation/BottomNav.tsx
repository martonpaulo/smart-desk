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
} from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';

import { navItems } from '@/legacy/navigation/navItems';

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { main, utility } = navItems;

  const [moreOpen, setMoreOpen] = useState(false);
  const toggleMore = (open: boolean) => () => setMoreOpen(open);

  const handleChange = (_: React.SyntheticEvent, newValue: string) => {
    if (newValue === '__more__') {
      setMoreOpen(true);
      return;
    }
    router.push(newValue);
  };

  useEffect(() => {
    [...main, ...utility].forEach(route => {
      try {
        router.prefetch(route.href);
      } catch {
        // ignore
      }
    });
  }, [main, router, utility]);

  const isRouteSelected = (path: string, href: string) =>
    path === href || path.startsWith(`${href}/`);

  const navValue = useMemo(() => {
    const match = [...main, ...utility].find(r => isRouteSelected(pathname, r.href));
    return match?.href ?? pathname;
  }, [pathname, main, utility]);

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
          sx={{
            px: 0.5,
            '& .MuiBottomNavigationAction-root': { minWidth: 0, px: 0.5 },
          }}
        >
          {main.map(route => (
            <BottomNavigationAction
              key={route.href}
              value={route.href}
              icon={route.icon}
              label={route.label}
              showLabel
              aria-label={route.label}
            />
          ))}

          <BottomNavigationAction
            key="more"
            value="__more__"
            icon={<MoreHorizIcon />}
            label="More"
            showLabel
            aria-label="More"
          />
        </BottomNavigation>
      </Paper>

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
          {utility.map(route => (
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
