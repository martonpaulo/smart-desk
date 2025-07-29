import { theme } from '@/theme';

export const transitions = {
  visibility: `visibility ${theme.transitions.duration.shorter}ms ${theme.transitions.easing.easeInOut}`,
  backgroundColor: `background-color ${theme.transitions.duration.shorter}ms ${theme.transitions.easing.easeInOut}`,
  input: `border-color ${theme.transitions.duration.shorter}ms, box-shadow ${theme.transitions.duration.shorter}ms, background-color ${theme.transitions.duration.shorter}ms ${theme.transitions.easing.easeInOut}`,
  grow: {
    transform: 'scale(1.03)',
    transition: `transform ${theme.transitions.duration.standard}ms ${theme.transitions.easing.easeInOut}`,
  },
};
