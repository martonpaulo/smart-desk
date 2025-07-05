import { ReactNode, SyntheticEvent, useState } from 'react';

import SettingsIcon from '@mui/icons-material/Settings';
import { Box, Dialog, DialogContent, DialogTitle, IconButton, Tab, Tabs } from '@mui/material';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
  tabs: Record<string, ReactNode>;
}

export function SettingsDialog({ open, onClose, tabs }: SettingsDialogProps) {
  const [tab, setTab] = useState(0);

  const handleTabChange = (_event: SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        <Tabs value={tab} onChange={handleTabChange} aria-label="settings tabs">
          {Object.keys(tabs).map(key => (
            <Tab key={key} label={key} />
          ))}
        </Tabs>
        {Object.values(tabs).map((content, index) => (
          <Box key={index} hidden={tab !== index} pt={2}>
            {content}
          </Box>
        ))}
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
