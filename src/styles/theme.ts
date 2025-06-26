import { createTheme } from '@mui/material';

export const theme = createTheme({
  breakpoints: {
    values: {
      mobile: 0,
      tablet: 767,
      desktop: 1200,
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
