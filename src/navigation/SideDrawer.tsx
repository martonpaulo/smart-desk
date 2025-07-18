'use client';

import { useState } from 'react';

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DeleteIcon from '@mui/icons-material/Delete';
import DraftsIcon from '@mui/icons-material/Drafts';
import HomeIcon from '@mui/icons-material/Home';
import ListAltIcon from '@mui/icons-material/ListAlt';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
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

const EXPANDED_WIDTH = 200;
const COLLAPSED_WIDTH = 60;

export function SideDrawer() {
  const theme = useTheme();
  const pathname = usePathname() || '/';
  const [collapsed, setCollapsed] = useState(false);
  const width = collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  const menu = [
    { label: 'Home', href: '/', icon: <HomeIcon /> },
    { label: 'All Tasks', href: '/tasks', icon: <ListAltIcon /> },
    { label: 'Matrix', href: '/matrix', icon: <DashboardIcon /> },
  ];
  const secondary = [
    { label: 'Drafts', href: '/drafts', icon: <DraftsIcon /> },
    { label: 'Trash', href: '/trash', icon: <DeleteIcon /> },
    { label: 'Settings', href: '/settings', icon: <SettingsIcon /> },
  ];

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
        {menu.map(({ label, href, icon }) => (
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

        {secondary.map(({ label, href, icon }) => (
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
