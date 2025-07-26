import { Button, Paper, Stack, Typography, useTheme } from '@mui/material';

interface TaskSelectionToolbarProps {
  selectedCount: number;
  onSelectAll: () => void;
  onSetToday: () => void;
  onClearDate: () => void;
  onMarkNone: () => void;
  onCancel: () => void;
}

export function TaskSelectionToolbar({
  selectedCount,
  onSelectAll,
  onSetToday,
  onClearDate,
  onMarkNone,
  onCancel,
}: TaskSelectionToolbarProps) {
  const theme = useTheme();

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'sticky',
        bottom: 0,
        p: 2,
        borderTop: 1,
        borderColor: 'divider',
        backgroundColor: theme.palette.background.paper,
        zIndex: theme.zIndex.appBar,
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={1}
      >
        <Typography variant="body2" sx={{ ml: 1 }}>
          {`${selectedCount} selected`}
        </Typography>
        <Stack direction="row" gap={1} flexWrap="wrap">
          <Button onClick={onSelectAll} size="small" variant="outlined">
            Select All
          </Button>
          <Button onClick={onSetToday} size="small" variant="contained">
            Set to Today
          </Button>
          <Button onClick={onClearDate} size="small" variant="contained">
            Clear Date
          </Button>
          <Button onClick={onMarkNone} size="small" variant="contained">
            Mark as Not Important & Not Urgent
          </Button>
          <Button onClick={onCancel} size="small" variant="outlined">
            Cancel
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
