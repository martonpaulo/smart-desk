import { alpha, Chip, useTheme } from '@mui/material';

import { useTagsStore } from '@/features/tag/store/TagsStore';

interface TagLabelProps {
  tagId: string;
  prefixId?: string;
}

export function TagLabel({ tagId, prefixId }: TagLabelProps) {
  const theme = useTheme();
  const tags = useTagsStore(state => state.items);

  const tag = tags.find(tag => tag.id === tagId);
  if (!tag) return null;

  const { color, name } = tag;

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
