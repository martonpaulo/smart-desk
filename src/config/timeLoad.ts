import { theme } from '@/styles/theme';

export const timeLoad = {
  stable: {
    label: 'Stable',
    color: theme.palette.success.main,
    startTime: 0, // starts at 0 minutes
    tooltip: "Good rhythm!<br />You're working within healthy limits",
  },
  caution: {
    label: 'Caution',
    color: theme.palette.secondary.main,
    startTime: 6 * 60, // starts after 6 hours
    tooltip: 'Energy may drop soon...<br />Plan breaks and limit context switching',
  },
  overloaded: {
    label: 'Overloaded',
    color: theme.palette.warning.main,
    startTime: 9 * 60, // starts after 9 hours
    tooltip: "You're pushing too hard!<br />Risk of mental fatigue or crash",
  },
  critical: {
    label: 'Critical',
    color: theme.palette.error.dark,
    startTime: 12 * 60, // starts after 12 hours
    tooltip: "Red zone!<br />Stop if possible<br />You're risking burnout!",
  },
};
