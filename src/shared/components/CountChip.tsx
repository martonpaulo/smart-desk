import { alpha, Chip } from '@mui/material';

interface CountChipProps {
  count: number;
  color: string;
}

export function CountChip({ count, color }: CountChipProps) {
  return (
    <Chip
      label={count}
      size="small"
      disabled
      sx={{
        '&.Mui-disabled': {
          opacity: 1,
          backgroundColor: alpha(color, 0.1),
          fontWeight: '400',
        },
      }}
    />
  );
}
