import { createTheme } from '@mui/material';

const baseTheme = createTheme();
baseTheme.shadows[1] = '0px 2px 4px rgba(0, 0, 0, 0.06)';

export const customShadows = baseTheme.shadows;
