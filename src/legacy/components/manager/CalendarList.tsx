'use client';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import EventNoteIcon from '@mui/icons-material/EventNote';
import LinkIcon from '@mui/icons-material/Link';
import {
  Avatar,
  Box,
  Chip,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { useSnackbar } from 'notistack';

import { playInterfaceSound } from '@/features/sound/utils/soundPlayer';
import { IcsCalendar } from '@/legacy/types/icsCalendar';

interface CalendarListProps {
  calendars: IcsCalendar[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

/**
 * Rich list with color swatch, copy URL, edit, and delete actions.
 * Sorted by most recently updated first. No memo hooks required.
 */
export function CalendarList({ calendars, onEdit, onDelete }: CalendarListProps) {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  if (calendars.length === 0) {
    return (
      <Box
        sx={{
          px: 1,
          py: 1.5,
          borderRadius: 1,
          bgcolor: theme.palette.action.hover,
          color: 'text.secondary',
          mb: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <EventNoteIcon fontSize="small" />
          <Typography variant="body2">No calendars configured</Typography>
        </Stack>
      </Box>
    );
  }

  // Sort by updatedAt desc without mutating original array
  const sorted = [...calendars].sort((a, b) => {
    const at = new Date(a.updatedAt ?? 0).getTime();
    const bt = new Date(b.updatedAt ?? 0).getTime();
    return bt - at;
  });

  function copyUrl(url: string) {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        enqueueSnackbar('ICS URL copied', { variant: 'info' });
        playInterfaceSound('send');
      })
      .catch(() => {
        enqueueSnackbar('Could not copy URL', { variant: 'error' });
        playInterfaceSound('error');
      });
  }

  return (
    <List dense disablePadding sx={{ mb: 2 }}>
      {sorted.map(cal => {
        const originalIndex = calendars.findIndex(c => c.id === cal.id);
        const updatedAgo =
          cal.updatedAt != null
            ? formatDistanceToNow(new Date(cal.updatedAt), { addSuffix: true })
            : 'N/A';

        return (
          <Box key={cal.id}>
            <ListItem
              secondaryAction={
                <Stack direction="row" spacing={0.5}>
                  <Tooltip title="Copy ICS URL">
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => copyUrl(cal.source)}
                      aria-label="Copy calendar URL"
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => onEdit(originalIndex)}
                      aria-label="Edit calendar"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      edge="end"
                      size="small"
                      color="error"
                      onClick={() => onDelete(originalIndex)}
                      aria-label="Delete calendar"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              }
              sx={{ pl: 0.5, pr: 0 }}
            >
              <ListItemAvatar>
                <Avatar
                  variant="rounded"
                  sx={{
                    width: 28,
                    height: 28,
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor: theme.palette.background.paper,
                  }}
                >
                  {/* color swatch */}
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: 0.5,
                      bgcolor: cal.color, // data-driven color value
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                    aria-label={`Color ${cal.color}`}
                  />
                </Avatar>
              </ListItemAvatar>

              <ListItemText
                primary={
                  <Stack direction="row" spacing={1} alignItems="center" overflow="hidden">
                    <Typography variant="body2" fontWeight={600} noWrap title={cal.title}>
                      {cal.title}
                    </Typography>
                    <Chip size="small" variant="outlined" icon={<LinkIcon />} label="ICS" />
                  </Stack>
                }
                secondary={
                  <Stack direction="row" spacing={1} alignItems="center" overflow="hidden">
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      noWrap
                      title={cal.source}
                      sx={{ maxWidth: 420 }}
                    >
                      {cal.source}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      • Updated {updatedAgo}
                    </Typography>
                  </Stack>
                }
                // Prevent invalid DOM nesting that causes hydration errors
                slotProps={{
                  primary: { component: 'div' },
                  secondary: { component: 'div' },
                }}
                sx={{ my: 0.5 }}
              />
            </ListItem>
            <Divider component="li" />
          </Box>
        );
      })}
    </List>
  );
}
