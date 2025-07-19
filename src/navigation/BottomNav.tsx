'use client';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
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
        <BottomNavigationAction value="/" icon={<HomeIcon />} />
        <BottomNavigationAction value="/drafts" icon={<DraftsIcon />} />

        <BottomNavigationAction value="/tasks" icon={<ListAltIcon />} />
        <BottomNavigationAction value="/calendars" icon={<CalendarTodayIcon />} />
        <BottomNavigationAction value="/account" icon={<AccountCircleIcon />} />
        <BottomNavigationAction value="/settings" icon={<SettingsIcon />} />
      </BottomNavigation>
    </Paper>
  );
}
