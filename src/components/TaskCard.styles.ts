import { Refresh as RepeatIcon } from '@mui/icons-material';
import { Box, ButtonGroup, IconButton, Stack, TextField, Typography } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';

import { transitions } from '@/styles/transitions';

export const Container = styled(Box, {
  shouldForwardProp: prop => prop !== 'color',
})<{ color: string }>(({ theme, color }) => ({
  borderRadius: theme.shape.borderRadius,
  position: 'relative',
  backgroundColor: alpha(color, 0.15),
  touchAction: 'none',
  cursor: 'grab',
  '&:hover .action-group': { visibility: 'visible' },
  '&:active': { cursor: 'grabbing' },
  boxShadow: `0 1px 3px ${alpha(color, 0.1)}`,
  display: 'flex',

  alignItems: 'center',
  transition: transitions.backgroundColor,
  '&:hover': {
    backgroundColor: alpha(color, 0.2),
  },
  flexWrap: 'wrap',
}));

export const Content = styled(Stack)({
  flexDirection: 'column',
});

export const TitleGroup = styled(Stack)(() => ({
  flexDirection: 'row',

  gap: '0.25rem',
}));

export const TitleInput = styled(TextField)(({ theme }) => ({
  width: '100%',
  '& .MuiInputBase-input': {
    ...theme.typography.body2,
  },
}));

interface TitleTextProps {
  done?: boolean;
  untitled?: boolean;
  textVariantSize?: 'body1' | 'body2';
  showActions?: boolean;
}

export const TitleText = styled(Typography, {
  shouldForwardProp: prop =>
    prop !== 'done' && prop !== 'untitled' && prop !== 'textVariantSize' && prop !== 'showActions',
})<TitleTextProps>(({ done, untitled, textVariantSize = 'body2', theme, showActions }) => ({
  ...theme.typography.body2,
  fontSize: theme.typography[textVariantSize].fontSize,
  userSelect: 'none',
  overflowWrap: 'anywhere',
  whiteSpace: 'normal',
  textDecoration: done ? 'line-through' : 'none',
  cursor: 'pointer',
  display: 'flex',
  gap: theme.spacing(0.25),
  color: untitled ? theme.palette.text.disabled : theme.palette.text.primary,
  '&:hover': {
    textDecoration: showActions ? (done ? 'line-through' : 'underline') : 'none',
  },
}));

export const RepeatIndicator = styled(RepeatIcon)(({ theme }) => ({
  fontSize: 12,
  alignSelf: 'flex-start',
  transform: 'rotate(240deg)',
  color: theme.palette.text.secondary,
}));

export const QuantityText = styled(Typography)(({ theme }) => ({
  ...theme.typography.caption,
  userSelect: 'none',
  textDecoration: 'none',
}));

export const DateText = styled(Typography)(({ theme }) => ({
  ...theme.typography.caption,
  userSelect: 'none',
  color: theme.palette.text.secondary,
}));

export const ActionGroup = styled(Box)({
  position: 'absolute',
  right: 6,
  display: 'flex',
  visibility: 'hidden',
  backgroundColor: 'transparent',
  borderRadius: '50%',
  transition: transitions.visibility,
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  zIndex: 2,
});

export const ActionWrapper = styled(ButtonGroup)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
  opacity: 0.95,
}));

export const ActionIcon = styled(IconButton)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  backgroundColor: 'transparent',
  fontSize: theme.typography.h3.fontSize,
  padding: theme.spacing(0.5),
}));
