import { createTheme } from '@mui/material';

import { customBreakpoints } from '@/theme/custom/breakpoints';
import { customShapes } from '@/theme/custom/shapes';
import { typography } from '@/theme/custom/typography';
import { shadows } from '@/theme/shadows';

const baseTheme = createTheme();

export const theme = createTheme({
  shape: customShapes,
  shadows: {
    ...baseTheme.shadows,
    ...shadows,
  },
  transitions: {
    duration: {
      shortest: 75,
      shorter: 100,
      short: 125,
      standard: 150,
      complex: 187,
      enteringScreen: 112,
      leavingScreen: 97,
    },
  },
  breakpoints: {
    values: customBreakpoints,
  },
  typography: {
    fontFamily: 'var(--font-poppins)',
    fontSize: 14, // base font size in px
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    ...typography,
  },
  components: {
    MuiAccordion: {
      styleOverrides: {
        root: {
          '&:before': {
            display: 'none',
          },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          overscrollBehavior: 'none',
        },
        body: {
          overscrollBehavior: 'none',
        },
        '#__next': {
          height: '100%',
          overflowY: 'auto',
          overscrollBehavior: 'none',
        },
        '*, *::before, *::after': {
          touchAction: 'manipulation',
        },
        code: {
          fontFamily: 'var(--font-code), monospace',
          letterSpacing: '-0.06em',
        },
        pre: {
          fontFamily: 'var(--font-code), monospace',
          letterSpacing: '-0.06em',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        sizeSmall: {
          fontSize: '0.65rem',
          height: '1rem',
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          minWidth: 48,
          padding: 4,
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.75rem',
          },
          '& .MuiSvgIcon-root': {
            fontSize: 20,
          },
        },
      },
    },
  },
});
