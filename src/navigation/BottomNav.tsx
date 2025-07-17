'use client';

import { useLocation as useRouterLocation, useNavigate } from 'react-router-dom';

import DashboardIcon from '@mui/icons-material/Dashboard';
import DeleteIcon from '@mui/icons-material/Delete';
import DraftsIcon from '@mui/icons-material/Drafts';
import HomeIcon from '@mui/icons-material/Home';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';

export function BottomNav() {
  const location = useRouterLocation();
  const navigate = useNavigate();

  const handleChange = (_: unknown, value: string) => navigate(value);

  return (
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
      <BottomNavigation value={location.pathname} onChange={handleChange} showLabels>
        <BottomNavigationAction label="Home" value="/" icon={<HomeIcon />} />
        <BottomNavigationAction label="Tasks" value="/tasks" icon={<ListAltIcon />} />
        <BottomNavigationAction label="Matrix" value="/matrix" icon={<DashboardIcon />} />
        <BottomNavigationAction label="Drafts" value="/drafts" icon={<DraftsIcon />} />
        <BottomNavigationAction label="Trash" value="/trash" icon={<DeleteIcon />} />
      </BottomNavigation>
    </Paper>
  );
}
