import { createTheme } from '@mui/material';

import { customBreakpoints } from '@/theme/custom/breakpoints';
import { customShapes } from '@/theme/custom/shapes';
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
    h1: {
      fontSize: '3.5rem',
      fontWeight: 400,
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 400,
    },
    h3: {
      fontSize: '1.125rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '0.9125rem',
      fontWeight: 400,
    },
    h5: {
      fontSize: '0.875rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 300,
    },
    subtitle1: {
      fontSize: '0.875rem',
      fontWeight: 400,
    },
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
        'li::marker': {
          fontSize: '0.75em',
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
