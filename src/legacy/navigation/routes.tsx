import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BoltIcon from '@mui/icons-material/Bolt';
import BuildIcon from '@mui/icons-material/Build';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import HomeIcon from '@mui/icons-material/Home';
import ImageIcon from '@mui/icons-material/Image';
import TagsIcon from '@mui/icons-material/LocalOffer';
import MapIcon from '@mui/icons-material/Map';
import NotesIcon from '@mui/icons-material/Notes';
import PlaceIcon from '@mui/icons-material/Place';
import SettingsIcon from '@mui/icons-material/Settings';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import ViewTimelineIcon from '@mui/icons-material/ViewTimeline';

export const routes = {
  primary: [
    { label: 'Board', href: '/', icon: <HomeIcon />, showOnMobile: true },
    { label: 'Quick List', href: '/quick', icon: <BoltIcon />, showOnMobile: true },
    { label: 'All Tasks', href: '/tasks', icon: <TaskAltIcon />, showOnMobile: true },
    { label: 'Planner', href: '/planner', icon: <ViewTimelineIcon />, showOnMobile: true },
    { label: 'Calendar', href: '/calendar', icon: <CalendarTodayIcon />, showOnMobile: true },
    { label: 'Gallery', href: '/gallery', icon: <ImageIcon />, showOnMobile: true },
    { label: 'Maps', href: '/maps', icon: <MapIcon />, showOnMobile: true },
    { label: 'Notes', href: '/notes', icon: <NotesIcon />, showOnMobile: true },
  ],
  secondary: [
    { label: 'Locations', href: '/location', icon: <PlaceIcon />, showOnMobile: true },
    { label: 'Tags', href: '/tags', icon: <TagsIcon />, showOnMobile: true },
    { label: 'Manage', href: '/manage', icon: <BuildIcon />, showOnMobile: true },
    { label: 'Account', href: '/account', icon: <AccountCircleIcon />, showOnMobile: true },
    { label: 'Settings', href: '/settings', icon: <SettingsIcon />, showOnMobile: true },
  ],
};
