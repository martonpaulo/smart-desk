'use client';

import EditIcon from '@mui/icons-material/Edit';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Button, Paper, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useMemo } from 'react';

import type { Note } from 'src/features/note/types/Note';
import { getDateLabel } from 'src/legacy/utils/timeUtils';

/**
 * Compact card with color accent, title, preview, and quick edit.
 * Content preview is plain-text, first lines only, to keep it light.
 */
type NoteCardProps = {
  note: Note;
  onEdit: () => void;
  onOpenInNewTab?: () => void;
};

export function NoteCard({ note, onEdit, onOpenInNewTab }: NoteCardProps) {
  const accent = note.color || '#999';
  const surface = alpha(accent, 0.1);

  const preview = useMemo(() => {
    const raw = String(note.content ?? '')
      .replace(/\r\n/g, '\n')
      .trim();
    // Convert very simple markdown headers to plain text hint
    const cleaned = raw.replace(/^#{1,6}\s*/gm, '');
    // Take first ~120 chars while avoiding cutting mid-word
    const short = cleaned.length > 140 ? cleaned.slice(0, 140) + '…' : cleaned;
    return short;
  }, [note.content]);

  return (
    <Paper
      variant="outlined"
      sx={{
        backgroundColor: surface,
        p: 1.5,
        height: '100%',
        display: 'flex',
      }}
    >
      <Stack gap={1.5} flexGrow={1} minWidth={0}>
        <Typography variant="h3" noWrap title={note.title}>
          {note.title || 'Untitled'}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            whiteSpace: 'pre-wrap',
          }}
        >
          {preview || 'No content'}
        </Typography>

        <Stack direction="row" justifyContent="space-between" alignItems="center" mt="auto">
          <Typography variant="caption" color="text.disabled">
            {getDateLabel(note.updatedAt ?? note.createdAt)}
          </Typography>
          <Stack direction="row" gap={0.5}>
            {onOpenInNewTab && (
              <Button size="small" startIcon={<OpenInNewIcon />} onClick={onOpenInNewTab}>
                Open
              </Button>
            )}
            <Button size="small" startIcon={<EditIcon />} onClick={onEdit}>
              Edit
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
}
