import { ChangeEvent, MouseEvent, useCallback, useEffect, useState } from 'react';

import {
  Box,
  InputAdornment,
  Popover,
  Stack,
  TextField,
  type TextFieldProps,
  Tooltip,
  Typography,
} from '@mui/material';
import { customColors } from 'src/legacy/styles/colors';
import { transitions } from 'src/legacy/styles/transitions';
import type { CustomColor } from 'src/shared/types/Color';

export function ColorPicker(props: TextFieldProps) {
  const {
    label = 'Color',
    placeholder = 'Select a color',
    value = '',
    onChange,
    onClick,
    slotProps = {},
    sx,
    ...rest
  } = props;

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedColor, setSelectedColor] = useState(value as string);

  useEffect(() => {
    setSelectedColor(value as string);
  }, [value]);

  const entries = Object.entries(customColors) as [string, CustomColor][];
  const selectedEntry = entries.find(([, c]) => c.value === selectedColor)?.[1];

  const handleOpen = (e: MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
    onClick?.(e as MouseEvent<HTMLDivElement>);
  };
  const handleClose = () => setAnchorEl(null);

  const handleSelect = useCallback(
    (color: string) => {
      setSelectedColor(color);
      handleClose();
      if (onChange) {
        const ev = {
          target: { name: props.name, value: color },
        } as ChangeEvent<HTMLInputElement>;
        onChange(ev);
      }
    },
    [onChange, props.name],
  );

  // build input props once
  const inputSlot = {
    placeholder: selectedEntry ? undefined : placeholder, // only when nothing selected
    readOnly: true,
    startAdornment: selectedEntry ? (
      <InputAdornment position="start">
        <Box
          width={24}
          height={24}
          bgcolor={selectedEntry.value}
          border="1px solid"
          borderColor="grey.400"
          borderRadius={1}
        />
      </InputAdornment>
    ) : undefined,
    endAdornment: selectedEntry ? (
      <InputAdornment position="end">
        <Typography variant="caption" color="text.secondary">
          {selectedEntry.value.toUpperCase()}
        </Typography>
      </InputAdornment>
    ) : undefined,
  };

  return (
    <>
      <TextField
        {...rest}
        fullWidth
        label={label}
        value={selectedEntry?.label || ''}
        onClick={handleOpen}
        slotProps={{
          ...slotProps,
          input: {
            ...slotProps.input,
            ...inputSlot,
          },
        }}
        sx={{
          '& .MuiInputAdornment-root': { cursor: 'pointer' },
          '& .MuiInputBase-root': { cursor: 'pointer' },
          input: { cursor: 'pointer' },
          ...sx,
        }}
      />

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Stack display="grid" gridTemplateColumns="repeat(5, 1fr)" gap={1} p={1}>
          {entries.map(([key, c]) => (
            <Tooltip
              key={key}
              title={c.label}
              placement="bottom"
              arrow
              slotProps={{
                tooltip: {
                  sx: {
                    bgcolor: 'grey.900',
                    color: 'common.white',
                    '& .MuiTooltip-arrow': { color: 'grey.900' },
                  },
                },
                popper: {
                  modifiers: [
                    { name: 'offset', options: { offset: [0, -10] } },
                    { name: 'preventOverflow', options: { padding: 0 } },
                  ],
                },
              }}
            >
              <Box
                component="button"
                type="button"
                onClick={() => handleSelect(c.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelect(c.value);
                  }
                }}
                tabIndex={0}
                width={40}
                height={40}
                borderRadius={1}
                border={c.value === selectedColor ? '2px solid' : '1px solid'}
                borderColor={c.value === selectedColor ? 'primary.main' : 'grey.400'}
                sx={{
                  bgcolor: c.value,
                  cursor: 'pointer',
                  ...transitions.grow.large,
                }}
              />
            </Tooltip>
          ))}
        </Stack>
      </Popover>
    </>
  );
}
