import { alpha, Card, CardContent, Typography, useTheme } from '@mui/material';

import { Note } from '@/features/note/types/Note';
import { customColors } from '@/legacy/styles/colors';
import { transitions } from '@/legacy/styles/transitions';
import { parseSafeHtml } from '@/legacy/utils/textUtils';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
}

export function NoteCard({ note, onEdit }: NoteCardProps) {
  const theme = useTheme();

  return (
    <Card
      variant="outlined"
      sx={{
        width: '100%',
        minWidth: 300,
        maxWidth: `calc(${100 / 3}% - 16px)`, // 3 cards per row with gap
        height: 280,
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'pointer',
        '&:hover': transitions.grow,
        boxShadow: theme.shadows[1],
        backgroundColor: alpha(customColors.blue.value, 0.1),
        borderColor: alpha(customColors.blue.value, 0.2),
      }}
      onClick={() => onEdit(note)}
    >
      <CardContent sx={{ overflow: 'hidden' }}>
        <Typography variant="h6" gutterBottom noWrap>
          {note.title || 'Untitled Note'}
        </Typography>

        {note.content.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No content available. Click to edit.
          </Typography>
        ) : (
          <Typography
            component="div"
            variant="body2"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 10,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'pre-line', // This preserves line breaks
            }}
            dangerouslySetInnerHTML={{ __html: String(parseSafeHtml(note.content)) }}
          />
        )}
      </CardContent>
    </Card>
  );
}
