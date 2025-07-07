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
        <Box sx={{ display: 'flex' }}>
          <Tabs
            orientation="vertical"
            value={tab}
            onChange={handleTabChange}
            aria-label="settings tabs"
            sx={{ borderRight: 1, borderColor: 'divider', minWidth: '120px' }}
          >
            {Object.keys(tabs).map(key => (
              <Tab key={key} label={key} />
            ))}
          </Tabs>
          <Box
            sx={{
              flexGrow: 1,
              ml: 2,
              maxWidth: 'calc(100% - 144px)',
              minHeight: '65vh',
              maxHeight: '65vh',
            }}
          >
            {Object.values(tabs).map((content, index) => (
              <Box key={index} hidden={tab !== index}>
                {content}
              </Box>
            ))}
          </Box>
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
