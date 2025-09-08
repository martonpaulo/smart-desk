'use client';

import { useCallback, useMemo, useState } from 'react';

import { Chip, IconButton, Paper, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { PageSection } from 'src/core/components/PageSection';
import type { Note } from 'src/features/note/types/Note';
import { useNotesStore } from 'src/features/note/store/useNotesStore';
import { MarkdownRenderer } from 'src/shared/components/MarkdownRenderer';

interface NoteFullViewProps {
  note: Note;
  onEdit?: () => void;
}

/**
 * Full view component for displaying a note with all its content.
 * Provides inline editing capabilities for title, color, and content.
 */
export function NoteFullView({ note }: NoteFullViewProps) {
  const { update } = useNotesStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: note.title || '',
    color: note.color || '#999',
    content: note.content || '',
  });

  const accent = note.color || '#999';
  const surface = alpha(accent, 0.05);

  // Format dates for display
  const createdDate = useMemo(() => {
    return new Date(note.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [note.createdAt]);

  const updatedDate = useMemo(() => {
    return new Date(note.updatedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [note.updatedAt]);

  const handleEdit = useCallback(() => {
    setEditData({
      title: note.title || '',
      color: note.color || '#999',
      content: note.content || '',
    });
    setIsEditing(true);
  }, [note]);

  const handleSave = useCallback(async () => {
    try {
      await update({ id: note.id, ...editData });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  }, [note.id, editData, update]);

  const handleCancel = useCallback(() => {
    setEditData({
      title: note.title || '',
      color: note.color || '#999',
      content: note.content || '',
    });
    setIsEditing(false);
  }, [note]);

  const handleFieldChange = useCallback((field: keyof typeof editData, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  }, []);

  const isDirty = useMemo(() => {
    return (
      editData.title !== (note.title || '') ||
      editData.color !== (note.color || '#999') ||
      editData.content !== (note.content || '')
    );
  }, [editData, note]);

  return (
    <PageSection
      title={isEditing ? 'Edit Note' : note.title || 'Untitled Note'}
      description={`Created: ${createdDate} • Last modified: ${updatedDate}`}
    >
      {/* Action buttons */}
      <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
        <Stack direction="row" gap={1}>
          {isEditing ? (
            <>
              <Tooltip title="Save changes">
                <IconButton onClick={handleSave} disabled={!isDirty} color="primary" size="small">
                  <SaveIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Cancel">
                <IconButton onClick={handleCancel} color="inherit" size="small">
                  <CancelIcon />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <Tooltip title="Edit note">
              <IconButton onClick={handleEdit} color="primary" size="small">
                <EditIcon />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Stack>
      {/* Note content */}
      <Paper
        variant="outlined"
        sx={{
          borderLeft: `6px solid ${isEditing ? editData.color : accent}`,
          backgroundColor: isEditing ? alpha(editData.color, 0.05) : surface,
          p: 3,
          minHeight: '400px',
        }}
      >
        <Stack gap={3}>
          {/* Note title */}
          {isEditing ? (
            <TextField
              fullWidth
              variant="outlined"
              label="Title"
              value={editData.title}
              onChange={e => handleFieldChange('title', e.target.value)}
              placeholder="Enter note title..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: '1.5rem',
                  fontWeight: 500,
                },
              }}
            />
          ) : (
            <Typography variant="h4" component="h1" fontWeight={500}>
              {note.title || 'Untitled Note'}
            </Typography>
          )}

          {/* Note metadata and color */}
          <Stack
            direction="row"
            gap={2}
            alignItems="center"
            flexWrap="wrap"
            justifyContent="space-between"
          >
            <Stack direction="row" gap={1} alignItems="center">
              {isEditing ? (
                <Stack direction="row" gap={1} alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Color:
                  </Typography>
                  <input
                    type="color"
                    value={editData.color}
                    onChange={e => handleFieldChange('color', e.target.value)}
                    style={{
                      width: 40,
                      height: 32,
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer',
                    }}
                  />
                  <Chip
                    label={editData.color}
                    size="small"
                    sx={{
                      backgroundColor: editData.color,
                      color: 'white',
                      '& .MuiChip-label': {
                        color: 'white',
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                      },
                    }}
                  />
                </Stack>
              ) : (
                note.color && (
                  <Chip
                    label="Color"
                    size="small"
                    sx={{
                      backgroundColor: accent,
                      color: 'white',
                      '& .MuiChip-label': {
                        color: 'white',
                      },
                    }}
                  />
                )
              )}
            </Stack>
          </Stack>

          {/* Note content */}
          <Stack>
            {isEditing ? (
              <TextField
                fullWidth
                multiline
                variant="outlined"
                label="Content (Markdown supported)"
                value={editData.content}
                onChange={e => handleFieldChange('content', e.target.value)}
                placeholder="Enter your note content... (Markdown supported)"
                minRows={10}
                maxRows={20}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                  },
                }}
              />
            ) : (
              <Stack>
                {note.content ? (
                  <MarkdownRenderer content={note.content} />
                ) : (
                  <Typography variant="body1" color="text.secondary" fontStyle="italic">
                    No content available for this note.
                  </Typography>
                )}
              </Stack>
            )}
          </Stack>

          {/* Preview mode indicator */}
          {isEditing && (
            <Stack
              sx={{
                p: 2,
                backgroundColor: alpha(editData.color, 0.1),
                borderRadius: 1,
                border: `1px solid ${alpha(editData.color, 0.3)}`,
              }}
            >
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
                Preview:
              </Typography>
              <Stack sx={{ minHeight: 100 }}>
                {editData.content ? (
                  <MarkdownRenderer content={editData.content} />
                ) : (
                  <Typography variant="body2" color="text.secondary" fontStyle="italic">
                    No content to preview...
                  </Typography>
                )}
              </Stack>
            </Stack>
          )}
        </Stack>
      </Paper>
    </PageSection>
  );
}
