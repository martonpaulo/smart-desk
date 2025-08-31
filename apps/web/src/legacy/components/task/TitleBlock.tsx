'use client';

import { RefObject } from 'react';

import { SxProps, TextField, Typography, useTheme } from '@mui/material';

type ReadProps = {
  mode: 'read';
  title: string;
  done?: boolean;
  untitled?: boolean;
  textVariantSize?: 'body1' | 'body2';
  onClickTitle?: () => void;
  dense?: boolean;
  sx?: SxProps;
};

type EditProps = {
  mode: 'edit';
  title: string;
  inputRef: RefObject<HTMLInputElement>;
  onChangeTitle: (value: string) => void;
  onBlurSave: () => void;
  onCancel: () => void;
  dense?: boolean;
  sx?: SxProps;
};

type TitleBlockProps = ReadProps | EditProps;

export function TitleBlock(props: TitleBlockProps) {
  const theme = useTheme();

  if (props.mode === 'edit') {
    const { title, inputRef, onChangeTitle, onBlurSave, onCancel, sx } = props;
    return (
      <TextField
        value={title}
        inputRef={inputRef}
        variant="standard"
        onChange={e => onChangeTitle(e.target.value)}
        onBlur={onBlurSave}
        onKeyDown={e => {
          if (e.key === 'Enter') onBlurSave();
          if (e.key === 'Escape') onCancel();
        }}
        fullWidth
        sx={[
          {
            '& .MuiInputBase-input': {
              ...theme.typography.body2,
            },
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      />
    );
  }

  const { title, done, untitled, textVariantSize = 'body2', onClickTitle, sx } = props;

  return (
    <Typography
      variant={props.dense ? 'h6' : 'body2'}
      sx={[
        {
          fontSize: props.dense ? 'h6' : theme.typography[textVariantSize].fontSize,
          userSelect: 'none',
          textDecoration: done ? 'line-through' : 'none',
          cursor: 'pointer',
          color: untitled ? theme.palette.text.disabled : theme.palette.text.primary,
          '&:hover': { textDecoration: done ? 'line-through' : 'underline' },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      onClick={onClickTitle}
      title={title}
    >
      {title}
    </Typography>
  );
}
