import { alpha } from '@mui/material/styles';

export function buildMobileGlobalStyles() {
  return {
    '@media (prefers-reduced-motion: reduce)': {
      '*, *::before, *::after': {
        animationDuration: '0.01ms !important',
        animationIterationCount: '1 !important',
        transitionDuration: '0.01ms !important',
        scrollBehavior: 'auto !important',
      },
    },
    '@media (hover: none), (pointer: coarse)': {
      '.MuiTooltip-popper': { display: 'none !important' },
      '.MuiTouchRipple-root': { display: 'none !important' },
      '.MuiPopover-paper, .MuiMenu-paper, .MuiDialog-paper': {
        transitionDuration: '120ms !important',
        willChange: 'opacity, transform',
      },
      '.MuiSkeleton-root.MuiSkeleton-wave::after': {
        animationDuration: '1.2s !important',
        opacity: 0.25,
      },
      a: { WebkitTapHighlightColor: 'transparent' },
      button: { WebkitTapHighlightColor: 'transparent' },
      '*:focus': { outline: 'none' },
    },
    html: { WebkitTextSizeAdjust: '100%' },
    body: {
      overscrollBehaviorY: 'none',
      backgroundColor: 'var(--mui-palette-background-default)',
      color: 'var(--mui-palette-text-primary)',
      paddingTop: 'env(safe-area-inset-top)',
      paddingBottom: 'env(safe-area-inset-bottom)',
    },
    '*::-webkit-scrollbar': { width: 6, height: 6 },
    '*::-webkit-scrollbar-thumb': {
      backgroundColor: alpha('#000', 0.2),
      borderRadius: 999,
    },
    'input, select, textarea': { fontSize: 16 },
    '.no-overscroll': { overscrollBehavior: 'contain' },
  };
}
