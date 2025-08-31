'use client';

import { useState } from 'react';

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MenuIcon from '@mui/icons-material/Menu';
import {
  Avatar,
  Button,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useSyncTrigger } from '@/core/hook/useSyncTriggers';
import { useConnectivityStore } from '@/core/store/useConnectivityStore';
import { navItems } from '@/legacy/navigation/navItems';
import { SyncStatusIcon } from '@/shared/components/SyncStatusIcon';

export function SideDrawer() {
  // Select the boolean primitive, not a function reference
  const canSync = useConnectivityStore(s => s.canSync);

  const theme = useTheme();

  const pathname = usePathname() || '/';
  const [collapsed, setCollapsed] = useState(true);

  const COLLAPSED_SPACING_WIDTH = 8;
  const EXPANDED_SPACING_WIDTH = 26;

  const ITEM_SPACING = 2;

  const width = theme.spacing(collapsed ? COLLAPSED_SPACING_WIDTH : EXPANDED_SPACING_WIDTH);

  const ICON_SLOT_WIDTH = theme.spacing(COLLAPSED_SPACING_WIDTH / 2);
  const ITEM_PX = theme.spacing(ITEM_SPACING);
  const ITEM_GAP = theme.spacing(ITEM_SPACING);

  const isRouteSelected = (currentPath: string, href: string) =>
    currentPath === href || currentPath.startsWith(`${href}/`);

  const labelStyles = {
    opacity: collapsed ? 0 : 1,
    width: collapsed ? 0 : 'auto',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    transition: theme.transitions.create(['opacity', 'width'], {
      duration: theme.transitions.duration.shorter,
    }),
  };

  const iconStyles = (selected: boolean) => ({
    minWidth: 0,
    width: ICON_SLOT_WIDTH,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: selected ? theme.palette.primary.main : theme.palette.text.secondary,
  });

  const itemButtonStyles = {
    justifyContent: 'flex-start',
    px: ITEM_PX,
    columnGap: ITEM_GAP,
  };

  const [triggerKey, setTriggerKey] = useState(0);
  const { label: syncLabel } = useSyncTrigger({ triggerKey });

  return (
    <Drawer
      variant="permanent"
      sx={{
        width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        },
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        paddingX={2}
        paddingY={1.5}
        position="relative"
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={collapsed ? 0 : 1.25}
          onClick={() => {
            if (collapsed) setCollapsed(false);
          }}
          role="button"
          aria-label="SmartDesk"
          sx={{ cursor: 'pointer', userSelect: 'none' }}
        >
          <Avatar
            src="/icon0.svg"
            alt="SmartDesk"
            variant="rounded"
            sx={{ width: theme.spacing(4.5), height: theme.spacing(4.5), bgcolor: 'transparent' }}
            slotProps={{ img: { draggable: false } }}
          />
          {!collapsed && (
            <Typography
              variant="subtitle1"
              color="text.primary"
              sx={{ fontWeight: 500, lineHeight: 1, fontSize: '1rem' }}
            >
              SmartDesk
            </Typography>
          )}
        </Stack>

        <IconButton
          aria-label={collapsed ? 'Expand' : 'Collapse'}
          onClick={() => setCollapsed(!collapsed)}
          size="small"
          sx={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            padding: 0,
            margin: 0,
            borderRadius: 0,
            '&:hover': { backgroundColor: 'transparent' },
          }}
        >
          {collapsed ? <MenuIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
        </IconButton>
      </Stack>

      <Stack flexGrow={1} overflow="hidden">
        <Stack paddingX={ITEM_PX} paddingTop={1} paddingBottom={0.5}>
          <Typography
            variant="overline"
            visibility={collapsed ? 'hidden' : 'visible'}
            color="text.secondary"
            sx={{ letterSpacing: 0.6 }}
          >
            Main
          </Typography>
        </Stack>

        <List disablePadding sx={{ overflowY: 'auto' }}>
          {navItems.main.map(({ label, href, icon }) => {
            const selected = isRouteSelected(pathname, href);
            return (
              <ListItemButton
                key={href}
                component={Link}
                href={href}
                selected={selected}
                sx={itemButtonStyles}
              >
                <ListItemIcon sx={iconStyles(selected)}>{icon}</ListItemIcon>
                <ListItemText primary={label} sx={labelStyles} />
              </ListItemButton>
            );
          })}
        </List>
      </Stack>

      <Stack marginTop={1} paddingBottom={1}>
        <Stack paddingX={ITEM_PX} paddingTop={1} paddingBottom={0.5}>
          <Typography
            variant="overline"
            visibility={collapsed ? 'hidden' : 'visible'}
            color="text.secondary"
            sx={{ letterSpacing: 0.6 }}
          >
            Utility
          </Typography>
        </Stack>

        <List disablePadding>
          <Stack
            mx={theme.spacing(1)}
            pb={theme.spacing(1)}
            alignItems="center"
            width={`calc(100% - ${theme.spacing(2)})`}
          >
            <Button
              variant="outlined"
              disabled={!canSync}
              fullWidth
              onClick={() => setTriggerKey(k => k + 1)}
              startIcon={<SyncStatusIcon />}
              sx={{
                textTransform: 'none',
                height: theme.spacing(5),
                justifyContent: 'flex-start',
                minWidth: 0,
                padding: 0,
                paddingLeft: `calc(${ITEM_PX} - ${theme.spacing(0.5)})`,
                '& .MuiButton-startIcon': {
                  m: 0,
                  mr: collapsed ? 0 : `calc(${ITEM_GAP} - ${theme.spacing(0.75)})`,
                  width: ICON_SLOT_WIDTH,
                  display: 'flex',
                  alignItems: 'center',
                },
              }}
            >
              <span style={{ display: collapsed ? 'none' : 'inline' }}>{syncLabel}</span>
            </Button>
          </Stack>

          {navItems.utility.map(({ label, href, icon }) => {
            const selected = isRouteSelected(pathname, href);
            return (
              <ListItemButton
                key={href}
                component={Link}
                href={href}
                selected={selected}
                sx={itemButtonStyles}
              >
                <ListItemIcon sx={iconStyles(selected)}>{icon}</ListItemIcon>
                <ListItemText primary={label} sx={labelStyles} />
              </ListItemButton>
            );
          })}
        </List>
      </Stack>
    </Drawer>
  );
}
