'use client';

import { alpha, Chip, useTheme } from '@mui/material';

import { Tag } from '@/features/tag/types/Tag';

type TagLabelProps = {
  tag: Tag;
  size?: 'x-small' | 'small' | 'medium';
  onClick?: () => void;
};

export function TagLabel({ tag, size = 'small', onClick }: TagLabelProps) {
  const theme = useTheme();
  const { color, name } = tag;
  const backgroundColor = size === 'medium' ? alpha(color, 0.7) : alpha(color, 0.5);
  const fontColor = theme.palette.getContrastText(backgroundColor);

  return (
    <Chip
      label={name}
      key={tag.id}
      size={size === 'x-small' ? 'small' : size}
      disabled={!onClick}
      onClick={onClick}
      clickable={!!onClick}
      variant="filled"
      sx={{
        fontSize: size === 'small' ? '0.65rem' : size === 'x-small' ? '0.5rem' : '1rem',
        fontWeight: size === 'medium' ? 500 : 300,
        borderRadius: 1,
        backgroundColor,
        px: size === 'x-small' ? 0.25 : 0.5,
        color: onClick ? 'white' : fontColor,
        '& .MuiChip-label': { padding: size === 'medium' ? '0 0.5rem' : 0 },
        '&.Mui-disabled': { color: fontColor, opacity: 1 },
      }}
    />
  );
}
