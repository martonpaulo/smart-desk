import { ReactNode } from 'react';

import { Button, ButtonProps } from '@mui/material';
import { useUiPrefsStore } from 'src/legacy/store/uiPrefsStore';

interface ResetZoomButtonProps extends ButtonProps {
  onClick?: () => void;
  children?: ReactNode;
  variant?: 'text' | 'outlined' | 'contained';
  size?: 'small' | 'medium' | 'large';
}

export function ResetZoomButton({
  onClick,
  children,
  variant = 'outlined',
  size = 'small',
  ...props
}: ResetZoomButtonProps) {
  const setZoom = useUiPrefsStore(state => state.setZoom);
  const resetZoom = () => {
    setZoom(1);
  };

  return (
    <Button
      {...props}
      variant={variant}
      size={size}
      onClick={() => {
        resetZoom();
        if (onClick) onClick();
      }}
      sx={{
        ...props.sx,
      }}
    >
      {children || 'Reset Zoom'}
    </Button>
  );
}
