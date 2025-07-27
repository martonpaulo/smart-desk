import { Refresh as RepeatIcon } from '@mui/icons-material';
import { Box, ButtonGroup, IconButton, Stack, TextField, Typography } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';

import { transitions } from '@/legacy/styles/transitions';

export const Container = styled(Box, {
  shouldForwardProp: prop => prop !== 'color' && prop !== 'selected',
})<{ color: string; selected?: boolean }>(({ theme, color, selected }) => ({
  borderRadius: theme.shape.borderRadius,
  position: 'relative',
  backgroundColor: alpha(color, selected ? 0.25 : 0.15),
  border: selected ? `2px solid ${theme.palette.primary.main}` : 'none',
  touchAction: 'none',
  cursor: 'grab',
  '&:hover .action-group': { visibility: 'visible' },
  '&:active': { cursor: 'grabbing' },
  boxShadow: `0 1px 3px ${alpha(color, 0.1)}`,
  display: 'flex',
  alignItems: 'center',
  transition: transitions.backgroundColor,
  '&:hover': {
    backgroundColor: alpha(color, selected ? 0.3 : 0.2),
  },
}));

export const Content = styled(Stack)({
  flexDirection: 'column',
  flexGrow: 1,
});

export const FirstRow = styled(Stack)(() => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: 4,
}));

export const TitleGroup = styled(Stack)(() => ({
  flexDirection: 'row',
  display: 'inline-flex',
  flexWrap: 'wrap',
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
  textDecoration: done ? 'line-through' : 'none',
  cursor: 'pointer',
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

export const EstimatedTimeText = styled(Typography)(({ theme }) => ({
  ...theme.typography.caption,
  color: theme.palette.text.secondary,
  userSelect: 'none',
  textDecoration: 'none',
}));

export const QuantityText = styled(Typography)(({ theme }) => ({
  ...theme.typography.caption,
  color: theme.palette.text.secondary,
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
