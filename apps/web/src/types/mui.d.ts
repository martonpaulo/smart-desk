import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface BreakpointOverrides {
    xs: false;
    sm: false;
    md: false;
    lg: false;
    xl: false;
    mobileSm: true;
    mobileMd: true;
    mobileLg: true;
    tabletSm: true;
    tabletLg: true;
    laptopSm: true;
    laptopLg: true;
  }
  interface Shape {
    borderRadiusSmall: number;
    borderRadius: number;
    borderRadiusCircle: string;
  }
  interface Theme {
    shape: Shape;
  }
  interface ThemeOptions {
    shape?: Partial<Shape>;
  }
}
