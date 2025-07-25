import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BuildIcon from '@mui/icons-material/Build';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import TaskAltIcon from '@mui/icons-material/TaskAlt';

export const routes = {
  primary: [
    { label: 'Board', href: '/board', icon: <HomeIcon />, showOnMobile: true },
    { label: 'All Tasks', href: '/tasks', icon: <TaskAltIcon />, showOnMobile: true },
    { label: 'Matrix', href: '/matrix', icon: <DashboardIcon />, showOnMobile: false },
    { label: 'Calendar', href: '/calendar', icon: <CalendarTodayIcon />, showOnMobile: true },
  ],
  secondary: [
    { label: 'Manage', href: '/manage', icon: <BuildIcon />, showOnMobile: false },
    { label: 'Account', href: '/account', icon: <AccountCircleIcon />, showOnMobile: true },
    { label: 'Settings', href: '/settings', icon: <SettingsIcon />, showOnMobile: true },
  ],
};
