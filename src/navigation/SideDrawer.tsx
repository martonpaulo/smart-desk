'use client';

import { Link as RouterLink, useLocation as useRouterLocation } from 'react-router-dom';

import DashboardIcon from '@mui/icons-material/Dashboard';
import DeleteIcon from '@mui/icons-material/Delete';
import DraftsIcon from '@mui/icons-material/Drafts';
import HomeIcon from '@mui/icons-material/Home';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { Divider, Drawer, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';

const drawerWidth = 200;

export function SideDrawer() {
  const location = useRouterLocation();

  return (
    <Drawer variant="permanent" sx={{ width: drawerWidth, [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' } }}>
      <List>
        <ListItemButton component={RouterLink} to="/" selected={location.pathname === '/'}>
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Home" />
        </ListItemButton>
        <ListItemButton component={RouterLink} to="/tasks" selected={location.pathname === '/tasks'}>
          <ListItemIcon>
            <ListAltIcon />
          </ListItemIcon>
          <ListItemText primary="All Tasks" />
        </ListItemButton>
        <ListItemButton component={RouterLink} to="/matrix" selected={location.pathname === '/matrix'}>
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Matrix" />
        </ListItemButton>
        <Divider />
        <ListItemButton component={RouterLink} to="/drafts" selected={location.pathname === '/drafts'}>
          <ListItemIcon>
            <DraftsIcon />
          </ListItemIcon>
          <ListItemText primary="Drafts" />
        </ListItemButton>
        <ListItemButton component={RouterLink} to="/trash" selected={location.pathname === '/trash'}>
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          <ListItemText primary="Trash" />
        </ListItemButton>
      </List>
    </Drawer>
  );
}
