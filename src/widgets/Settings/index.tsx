import { useState } from 'react';

import SettingsIcon from '@mui/icons-material/Settings';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Tab,
  Tabs,
  Box,
  Typography,
} from '@mui/material';

import ICSCalendarManager from '@/widgets/ICSCalendarManager';
import { AuthControl, type AuthControlProps } from '@/widgets/AuthControl';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
  auth: AuthControlProps;
}

export function SettingsDialog({ open, onClose, auth }: SettingsDialogProps) {
  const [tab, setTab] = useState(0);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} aria-label="settings tabs">
          <Tab label="Calendars" />
          <Tab label="Account" />
        </Tabs>
        <Box hidden={tab !== 0} pt={2}>
          <ICSCalendarManager />
        </Box>
        <Box hidden={tab !== 1} pt={2}>
          <AuthControl {...auth} />
        </Box>
      </DialogContent>
    </Dialog>
  );
}

interface SettingsButtonProps {
  onClick: () => void;
}

export function SettingsButton({ onClick }: SettingsButtonProps) {
  return (
    <IconButton
      aria-label="settings"
      onClick={onClick}
      sx={theme => ({
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: theme.zIndex.modal + 1,
      })}
    >
      <SettingsIcon />
    </IconButton>
  );
}

export default SettingsDialog;
