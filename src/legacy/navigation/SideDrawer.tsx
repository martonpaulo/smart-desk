'use client';

import { useState } from 'react';

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MenuIcon from '@mui/icons-material/Menu';
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
} from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { routes } from '@/legacy/navigation/routes';

const EXPANDED_WIDTH = 200;
const COLLAPSED_WIDTH = 60;

export function SideDrawer() {
  const theme = useTheme();
  const pathname = usePathname() || '/';
  const [collapsed, setCollapsed] = useState(true);
  const width = collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width,
          boxSizing: 'border-box',
        },
      }}
    >
      {/* toggle button */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-end',
          p: 1,
        }}
      >
        <IconButton onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <MenuIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>

      <Divider />

      <List>
        {routes.primary.map(({ label, href, icon }) => (
          <ListItemButton
            key={href}
            component={Link}
            href={href}
            selected={pathname === href}
            sx={{
              justifyContent: collapsed ? 'center' : 'flex-start',
              px: collapsed ? 2 : 1,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: collapsed ? 0 : 2,
                justifyContent: 'center',
                color:
                  pathname === href ? theme.palette.primary.main : theme.palette.text.secondary,
              }}
            >
              {icon}
            </ListItemIcon>
            {!collapsed && <ListItemText primary={label} />}
          </ListItemButton>
        ))}

        <Divider sx={{ my: 1 }} />

        {routes.secondary.map(({ label, href, icon }) => (
          <ListItemButton
            key={href}
            component={Link}
            href={href}
            selected={pathname === href}
            sx={{
              justifyContent: collapsed ? 'center' : 'flex-start',
              px: collapsed ? 2 : 1,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: collapsed ? 0 : 2,
                justifyContent: 'center',
                color:
                  pathname === href ? theme.palette.primary.main : theme.palette.text.secondary,
              }}
            >
              {icon}
            </ListItemIcon>
            {!collapsed && <ListItemText primary={label} />}
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
}
