import type { Components, Theme } from '@mui/material';
import Grow from '@mui/material/Grow';
import Slide from '@mui/material/Slide';

export const mobileComponentsOverrides: Components<Omit<Theme, 'components'>> = {
  // Smaller components when screen is small
  MuiButton: { defaultProps: { size: 'small' } },

  MuiIconButton: {
    defaultProps: { size: 'small', disableRipple: true, disableTouchRipple: true },
    styleOverrides: {
      root: {
        // Minimum touch target
        minWidth: 40,
        minHeight: 40,
      },
    },
  },

  MuiTextField: { defaultProps: { size: 'small' } },

  MuiSelect: { defaultProps: { size: 'small' } },

  MuiFormControl: { defaultProps: { margin: 'dense' } },

  MuiListItemButton: {
    styleOverrides: { root: { minHeight: 44, paddingTop: 6, paddingBottom: 6 } },
  },

  // Lower shadows on mobile to reduce paint cost
  MuiPaper: {
    styleOverrides: {
      root: ({ theme }) => ({
        [theme.breakpoints.down('mobileLg')]: { boxShadow: theme.shadows[1] },
      }),
    },
  },

  // Dialog and menus already set transition via your config
  MuiDialog: {
    defaultProps: {
      slots: { transition: Grow },
      slotProps: { transition: { timeout: { enter: 160, exit: 120 } } },
      // iOS scroll lock can be annoying in PWA shells
      disableScrollLock: true,
      fullWidth: true,
      maxWidth: 'mobileLg',
    },
  },

  MuiMenu: {
    defaultProps: {
      slots: { transition: Grow },
      slotProps: { transition: { timeout: { enter: 140, exit: 100 } } },
      MenuListProps: { disablePadding: false, autoFocusItem: false },
      // Keep menus anchored well on small screens
      transformOrigin: { vertical: 'top', horizontal: 'right' },
      anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
    },
  },

  MuiSnackbar: {
    defaultProps: {
      slots: { transition: Slide },
      slotProps: { transition: { direction: 'up', timeout: { enter: 120, exit: 80 } } },
      anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
    },
    styleOverrides: {
      root: ({ theme }) => ({
        [theme.breakpoints.down('mobileLg')]: { maxWidth: '100vw' },
      }),
    },
  },

  // Keep transitions brisk and predictable where motion exists
  MuiCollapse: {
    defaultProps: { timeout: { enter: 140, exit: 110 } },
  },

  // Backdrop transition of Modal
  MuiModal: {
    defaultProps: {
      slotProps: { backdrop: { transitionDuration: { enter: 120, exit: 100 } } },
    },
  },

  // Popover uses a transition internally
  MuiPopover: {
    defaultProps: {
      // v7 prefers slots + slotProps over TransitionComponent/TransitionProps
      slots: { transition: Grow },
      slotProps: { transition: { timeout: { enter: 140, exit: 100 } } },
    },
  },

  // Tooltip already sets TransitionProps below, keep as is if you like
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
      tooltip: ({ theme }) => ({
        fontSize: '0.75rem',
        lineHeight: 1.25,
        padding: '6px 8px',
        maxWidth: 260,
        [theme.breakpoints.down('mobileLg')]: { fontSize: '0.8rem' },
      }),
      arrow: { transform: 'scale(0.9)' },
    },
  },

  // Buttons and clicks: reduce visual noise on touch devices
  MuiButtonBase: {
    defaultProps: {
      disableRipple: true,
      disableTouchRipple: true,
    },
  },
};
