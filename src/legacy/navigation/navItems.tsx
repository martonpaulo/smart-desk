import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';
import MapIcon from '@mui/icons-material/Map';
import NotesIcon from '@mui/icons-material/Notes';
import SettingsIcon from '@mui/icons-material/Settings';
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import ViewTimelineIcon from '@mui/icons-material/ViewTimeline';

export const navItems = {
  main: [
    { label: 'Dashboard', href: '/', icon: <SpaceDashboardIcon /> },
    { label: 'Planner', href: '/planner', icon: <ViewTimelineIcon /> },
    { label: 'Tasks', href: '/tasks', icon: <TaskAltIcon /> },
    { label: 'Calendar', href: '/calendar', icon: <CalendarTodayIcon /> },
    { label: 'Maps', href: '/maps', icon: <MapIcon /> },
    { label: 'Notes', href: '/notes', icon: <NotesIcon /> },
  ],
  utility: [
    { label: 'Content', href: '/content', icon: <CollectionsBookmarkIcon /> },
    { label: 'Account', href: '/account', icon: <AccountCircleIcon /> },
    { label: 'Settings', href: '/settings', icon: <SettingsIcon /> },
  ],
};
