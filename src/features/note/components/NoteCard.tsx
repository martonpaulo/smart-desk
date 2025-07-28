import { Card, CardContent, Typography } from '@mui/material';

import { Note } from '@/features/note/types/Note';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
}

export function NoteCard({ note, onEdit }: NoteCardProps) {
  return (
    <Card variant="outlined" sx={{ maxWidth: 345 }}>
      <CardContent onClick={() => onEdit(note)} sx={{ cursor: 'pointer' }}>
        <Typography variant="h6">{note.title || 'Untitled Note'}</Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {note.content || 'No content yet...'}
        </Typography>
      </CardContent>
    </Card>
  );
}
