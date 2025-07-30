import { alpha, Chip, useTheme } from '@mui/material';

import { useTagsStore } from '@/features/tag/store/TagsStore';
import { Tag } from '@/features/tag/types/Tag';

interface TagLabelProps {
  tagId?: string;
  tag?: Tag;
  prefixId?: string;
}

export function TagLabel({ tagId, tag, prefixId }: TagLabelProps) {
  const theme = useTheme();
  const tags = useTagsStore(state => state.items);

  const finalTag = tag ?? tags.find(t => t.id === tagId);
  if (!finalTag) return null;

  const { color, name } = finalTag;

  const backgroundColor = alpha(color, 0.5);
  const fontColor = theme.palette.getContrastText(backgroundColor);

  return (
    <Chip
      label={name}
      key={prefixId ? `${prefixId}-${tagId}` : tagId}
      size="small"
      disabled
      sx={{
        borderRadius: 1,
        backgroundColor,
        px: 0.5,
        '& .MuiChip-label': {
          padding: 0,
        },
        '&.Mui-disabled': {
          color: fontColor,
          opacity: 1,
        },
      }}
    />
  );
}
