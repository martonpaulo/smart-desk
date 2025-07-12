import { createTheme } from '@mui/material';

export const theme = createTheme({
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
    values: {
      mobileSm: 300,
      mobileLg: 600,
      tabletSm: 750,
      tabletLg: 900,
      laptopSm: 1050,
      laptopLg: 1200,
    },
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
    MuiChip: {
      styleOverrides: {
        sizeSmall: {
          fontSize: '0.65rem',
          height: '1rem',
        },
      },
    },
  },
});
