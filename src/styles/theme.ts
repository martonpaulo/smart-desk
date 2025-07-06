import { createTheme } from '@mui/material';

export const theme = createTheme({
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
      fontSize: '4rem',
      fontWeight: 400,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 300,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 300,
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
