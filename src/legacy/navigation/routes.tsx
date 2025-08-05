import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BoltIcon from '@mui/icons-material/Bolt';
import BuildIcon from '@mui/icons-material/Build';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HomeIcon from '@mui/icons-material/Home';
import ImageIcon from '@mui/icons-material/Image';
import TagsIcon from '@mui/icons-material/LocalOffer';
import MapIcon from '@mui/icons-material/Map';
import NotesIcon from '@mui/icons-material/Notes';
import SettingsIcon from '@mui/icons-material/Settings';
import TaskAltIcon from '@mui/icons-material/TaskAlt';

export const routes = {
  primary: [
    { label: 'Board', href: '/', icon: <HomeIcon />, showOnMobile: false },
    { label: 'Quick List', href: '/quick', icon: <BoltIcon />, showOnMobile: true },
    { label: 'All Tasks', href: '/tasks', icon: <TaskAltIcon />, showOnMobile: true },
    { label: 'Matrix', href: '/matrix', icon: <DashboardIcon />, showOnMobile: false },
    { label: 'Calendar', href: '/calendar', icon: <CalendarTodayIcon />, showOnMobile: true },
    { label: 'Gallery', href: '/gallery', icon: <ImageIcon />, showOnMobile: false },
    { label: 'Maps', href: '/maps', icon: <MapIcon />, showOnMobile: false },
    { label: 'Notes', href: '/notes', icon: <NotesIcon />, showOnMobile: true },
  ],
  secondary: [
    { label: 'Tags', href: '/tags', icon: <TagsIcon />, showOnMobile: true },
    { label: 'Manage', href: '/manage', icon: <BuildIcon />, showOnMobile: false },
    { label: 'Settings', href: '/settings', icon: <SettingsIcon />, showOnMobile: true },
    { label: 'Account', href: '/account', icon: <AccountCircleIcon />, showOnMobile: true },
  ],
};
