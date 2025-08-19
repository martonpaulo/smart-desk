import type { Components, Theme } from '@mui/material';
import Grow from '@mui/material/Grow';
import Slide from '@mui/material/Slide';

const mobileRoot = ':root[data-mobile="true"]';

export const mobileComponentsOverrides: Components<Omit<Theme, 'components'>> = {
  // Button visual compaction on mobile without leaking to desktop
  MuiButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        [mobileRoot + ' &']: {
          // emulate size="small" without touching props
          padding: theme.spacing(0.5, 1.25),
          minHeight: 32,
          fontSize: '0.8125rem',
        },
      }),
    },
  },

  MuiIconButton: {
    styleOverrides: {
      root: {
        [mobileRoot + ' &']: {
          minWidth: 40,
          minHeight: 40,
          // visually reduce ripple without props
          '& .MuiTouchRipple-root': { display: 'none' },
        },
      },
    },
  },

  MuiTextField: {
    styleOverrides: {
      root: {
        [mobileRoot + ' &']: {
          // emulate size="small" field density
          '--InputLabel-margin': '0.125rem',
          '& .MuiInputBase-root': { minHeight: 36 },
        },
      },
    },
  },

  MuiSelect: {
    styleOverrides: {
      select: ({ theme }) => ({
        [mobileRoot + ' &']: { paddingBlock: theme.spacing(0.5) },
      }),
    },
  },

  MuiFormControl: {
    styleOverrides: {
      root: ({ theme }) => ({
        [mobileRoot + ' &']: { margin: theme.spacing(0.5, 0) }, // emulate margin="dense"
      }),
    },
  },

  MuiListItemButton: {
    styleOverrides: {
      root: {
        [mobileRoot + ' &']: { minHeight: 44, paddingTop: 6, paddingBottom: 6 },
      },
    },
  },

  // Lower shadows on mobile to reduce paint cost
  MuiPaper: {
    styleOverrides: {
      root: ({ theme }) => ({
        [mobileRoot + ' &']: { boxShadow: theme.shadows[1] },
      }),
    },
  },

  // Dialog and menus transitions kept but scoped to mobile via slotProps styles
  MuiDialog: {
    defaultProps: {
      TransitionComponent: Grow,
      TransitionProps: { timeout: { enter: 160, exit: 120 } },
      disableScrollLock: true,
      fullWidth: true,
    },
    styleOverrides: {
      paper: ({ theme }) => ({
        [mobileRoot + ' &']: {
          margin: theme.spacing(1),
          width: 'calc(100% - 16px)',
          maxWidth: theme.breakpoints.values.mobileLg,
        },
      }),
    },
  },

  MuiMenu: {
    defaultProps: {
      TransitionComponent: Grow,
      TransitionProps: { timeout: { enter: 140, exit: 100 } },
      MenuListProps: { disablePadding: false, autoFocusItem: false },
    },
    styleOverrides: {
      paper: {
        [mobileRoot + ' &']: { transformOrigin: 'top right' },
      },
    },
  },

  MuiSnackbar: {
    defaultProps: {
      TransitionComponent: Slide,
      TransitionProps: {
        timeout: { enter: 120, exit: 80 },
      },
      slotProps: {
        transition: {
          direction: 'up',
        },
      },
    },
    styleOverrides: {
      root: { [mobileRoot + ' &']: { maxWidth: '100vw' } },
      anchorOriginBottomCenter: { [mobileRoot + ' &']: { bottom: 8 } },
    },
  },

  MuiCollapse: { defaultProps: { timeout: { enter: 140, exit: 110 } } },

  MuiModal: {
    defaultProps: {
      slotProps: { backdrop: { transitionDuration: { enter: 120, exit: 100 } } },
    },
  },

  MuiBackdrop: {
    defaultProps: { transitionDuration: { enter: 120, exit: 100 } },
  },

  MuiPopover: {
    defaultProps: {
      TransitionComponent: Grow,
      TransitionProps: { timeout: { enter: 140, exit: 100 } },
    },
  },

  MuiTooltip: {
    defaultProps: {
      arrow: true,
      placement: 'bottom',
      disableInteractive: true,
      enterDelay: 150,
      leaveDelay: 0,
      enterTouchDelay: 400,
      leaveTouchDelay: 0,
      TransitionProps: { timeout: { enter: 120, exit: 80 } },
    },
    styleOverrides: {
      tooltip: {
        fontSize: '0.75rem',
        lineHeight: 1.25,
        padding: '6px 8px',
        maxWidth: 260,
        [mobileRoot + ' &']: { fontSize: '0.8rem' },
      },
      arrow: { transform: 'scale(0.9)' },
    },
  },

  MuiButtonBase: {
    styleOverrides: {
      root: {
        [mobileRoot + ' &']: {
          // emulate disableRipple without props
          '& .MuiTouchRipple-root': { display: 'none' },
        },
      },
    },
  },
};
