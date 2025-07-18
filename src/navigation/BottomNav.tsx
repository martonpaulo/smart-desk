'use client';

import DashboardIcon from '@mui/icons-material/Dashboard';
import DeleteIcon from '@mui/icons-material/Delete';
import DraftsIcon from '@mui/icons-material/Drafts';
import HomeIcon from '@mui/icons-material/Home';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SettingsIcon from '@mui/icons-material/Settings';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';

export function BottomNav() {
  const pathname = usePathname(); // current URL path
  const router = useRouter(); // router for client‑side navigation

  // when tab changes, push the new route
  const handleChange = (_: React.SyntheticEvent, newValue: string) => {
    router.push(newValue);
  };

  return (
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
      <BottomNavigation value={pathname} onChange={handleChange} showLabels>
        <BottomNavigationAction label="Home" value="/" icon={<HomeIcon />} />
        <BottomNavigationAction label="Tasks" value="/tasks" icon={<ListAltIcon />} />
        <BottomNavigationAction label="Matrix" value="/matrix" icon={<DashboardIcon />} />
        <BottomNavigationAction label="Drafts" value="/drafts" icon={<DraftsIcon />} />
        <BottomNavigationAction label="Trash" value="/trash" icon={<DeleteIcon />} />
        <BottomNavigationAction label="Settings" value="/settings" icon={<SettingsIcon />} />
      </BottomNavigation>
    </Paper>
  );
}
