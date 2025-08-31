'use client';

import { useMemo } from 'react';

import EditIcon from '@mui/icons-material/Edit';
import { Button, Paper, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import type { Note } from '@/features/note/types/Note';

/**
 * Compact card with color accent, title, preview, and quick edit.
 * Content preview is plain-text, first lines only, to keep it light.
 */
type NoteCardProps = {
  note: Note;
  onEdit: () => void;
};

export function NoteCard({ note, onEdit }: NoteCardProps) {
  const accent = note.color || '#999';
  const surface = alpha(accent, 0.1);

  const preview = useMemo(() => {
    const raw = String(note.content ?? '')
      .replace(/\r\n/g, '\n')
      .trim();
    // Take first ~120 chars while avoiding cutting mid-word
    const short = raw.length > 140 ? raw.slice(0, 140) + '…' : raw;
    // Convert very simple markdown headers to plain text hint
    return short.replace(/^#{1,6}\s*/gm, '');
  }, [note.content]);

  return (
    <Paper
      variant="outlined"
      sx={{
        borderLeft: `4px solid ${accent}`,
        backgroundColor: surface,
        p: 1.25,
        height: '100%',
        display: 'flex',
      }}
    >
      <Stack gap={1} flexGrow={1} minWidth={0}>
        <Typography
          variant="subtitle2"
          noWrap
          title={note.title}
          sx={{ fontWeight: 600, lineHeight: 1.2 }}
        >
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
          }}
        >
          {preview || 'No content'}
        </Typography>

        <Stack direction="row" justifyContent="space-between" alignItems="center" mt="auto">
          <Typography variant="caption" color="text.disabled">
            {new Date(note.updatedAt ?? note.createdAt).toLocaleDateString()}
          </Typography>
          <Button size="small" startIcon={<EditIcon />} onClick={onEdit}>
            Edit
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
