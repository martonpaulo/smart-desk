import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface BreakpointOverrides {
    xs: false;
    sm: false;
    md: false;
    lg: false;
    xl: false;
    mobileSm: true;
    mobileLg: true;
    tabletSm: true;
    tabletLg: true;
    laptopSm: true;
    laptopLg: true;
  }
}
