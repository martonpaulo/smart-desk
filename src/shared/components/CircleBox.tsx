import { useTheme } from '@mui/material';
import { Box } from '@mui/material';

type CircleBoxProps = {
  color: string;
  size: number;
};

export function CircleBox({ color, size }: CircleBoxProps) {
  const theme = useTheme();

  return (
    <Box
      width={theme.spacing(size)}
      height={theme.spacing(size)}
      borderRadius={theme.shape.borderRadiusCircle}
      bgcolor={color}
    />
  );
}
