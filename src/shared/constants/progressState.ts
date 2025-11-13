import { theme } from 'src/theme';

export const progressState = {
  low: {
    label: 'Just Started',
    color: theme.palette.error.main,
    fontWeight: 'normal' as const,
    startPercent: 0,
  },
  medium: {
    label: 'In Progress',
    color: theme.palette.warning.main,
    fontWeight: 'medium' as const,
    startPercent: 30,
  },
  high: {
    label: 'Almost There',
    color: theme.palette.info.main,
    fontWeight: 'bold' as const,
    startPercent: 60,
  },
  complete: {
    label: 'Great Job!',
    color: theme.palette.success.main,
    fontWeight: 'bold' as const,
    startPercent: 90,
  },
};
