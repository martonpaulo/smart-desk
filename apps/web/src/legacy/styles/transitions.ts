import { CSSObject } from '@emotion/react';
import { theme } from 'src/theme';

const scaleValues = {
  small: 1.03,
  medium: 1.05,
  large: 1.1,
};

export const transitions = {
  visibility: `visibility ${theme.transitions.duration.shorter}ms ${theme.transitions.easing.easeInOut}`,
  backgroundColor: `background-color ${theme.transitions.duration.shorter}ms ${theme.transitions.easing.easeInOut}`,
  input: `border-color ${theme.transitions.duration.shorter}ms, box-shadow ${theme.transitions.duration.shorter}ms, background-color ${theme.transitions.duration.shorter}ms ${theme.transitions.easing.easeInOut}`,

  // use it like this: sx={{ ...transitions.grow.small }}
  grow: Object.fromEntries(
    (Object.entries(scaleValues) as [keyof typeof scaleValues, number][]).map(([key, scale]) => [
      key,
      {
        transition: `transform ${theme.transitions.duration.standard}ms ${theme.transitions.easing.easeInOut}`,
        '&:hover': {
          transform: `scale(${scale})`,
        },
      } as CSSObject,
    ]),
  ) as Record<keyof typeof scaleValues, CSSObject>,
};
