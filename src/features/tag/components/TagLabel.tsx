'use client';

import { alpha, Chip, useTheme } from '@mui/material';

import { Tag } from '@/features/tag/types/Tag';

type TagLabelProps = {
  tag: Tag;
  size?: 'small' | 'medium';
  onClick?: () => void;
};

export function TagLabel({ tag, size = 'small', onClick }: TagLabelProps) {
  const theme = useTheme();
  const { color, name } = tag;
  const backgroundColor = size === 'small' ? alpha(color, 0.5) : alpha(color, 0.7);
  const fontColor = theme.palette.getContrastText(backgroundColor);

  return (
    <Chip
      label={name}
      key={tag.id}
      size={size}
      disabled={!onClick}
      onClick={onClick}
      clickable={!!onClick}
      variant="filled"
      sx={{
        fontSize: size === 'small' ? '0.65rem' : '1rem',
        fontWeight: size === 'small' ? 300 : 500,
        borderRadius: 1,
        backgroundColor,
        px: 0.5,
        color: onClick ? 'white' : fontColor,
        '& .MuiChip-label': { padding: size === 'small' ? 0 : '0 0.5rem' },
        '&.Mui-disabled': { color: fontColor, opacity: 1 },
      }}
    />
  );
}
