import { ChangeEvent, FocusEvent, KeyboardEvent, useCallback, useEffect, useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';

import { theme } from '@/styles/theme';
import { formatValue, parseValue } from '@/utils/stringUtils';

export interface QuantitySelectorProps {
  value: number;
  onValueChange: (value: number) => void;
  step?: number;
  minValue?: number;
  maxValue?: number;
  formatFn?: (value: number) => string;
  parseFn?: (str: string) => number;
  suffix?: string;
  singularSuffix?: string;
  hasSpace?: boolean;
}

export function QuantitySelector({
  value,
  onValueChange,
  step = 1,
  minValue = 0,
  maxValue = Infinity,
  suffix = '',
  singularSuffix = '',
  hasSpace = true,
  formatFn,
  parseFn = parseValue,
}: QuantitySelectorProps) {
  const getFormattedValue = useCallback(
    (val: number) => (formatFn ?? (v => formatValue(v, suffix, singularSuffix, hasSpace)))(val),
    [formatFn, suffix, singularSuffix, hasSpace],
  );

  const [displayValue, setDisplayValue] = useState<string>(getFormattedValue(value));

  // whenever external value prop changes, resync displayValue
  useEffect(() => {
    setDisplayValue(getFormattedValue(value));
  }, [value, suffix, singularSuffix, hasSpace, formatFn, getFormattedValue]);

  // apply min/max bounds safely
  const clamp = (v: number) => Math.min(Math.max(v, minValue), maxValue);

  // commit the text in the input back to a numeric minute value
  const commitDisplayValue = () => {
    const parsed = parseFn(displayValue);
    const clamped = clamp(parsed);
    onValueChange(clamped);
  };

  // handle blur or Enter → commit
  const handleBlur = () => commitDisplayValue();

  // Round up to nearest multiple of step
  const getNextStepUp = (value: number) => {
    const remainder = value % step;
    return remainder === 0 ? clamp(value + step) : clamp(value + (step - remainder));
  };

  // Round down to previous multiple of step
  const getNextStepDown = (value: number) => {
    const remainder = value % step;
    return remainder === 0 ? clamp(value - step) : clamp(value - remainder);
  };

  // increment/decrement by step, clamped
  const handleIncrement = () => onValueChange(getNextStepUp(value));
  const handleDecrement = () => onValueChange(getNextStepDown(value));

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commitDisplayValue();
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault(); // avoid cursor jump
      handleIncrement();
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleDecrement();
    }
  };

  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  // live‐update the raw text, but don’t commit until blur/Enter
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => setDisplayValue(e.target.value);

  return (
    <TextField
      variant="standard"
      value={displayValue}
      onChange={handleInputChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      fullWidth={false}
      sx={{
        width: 170,
        '& .MuiInputBase-root': {
          height: theme.spacing(5),
          fontSize: theme.typography.body2.fontSize,
          fontWeight: theme.typography.body2.fontWeight,
          lineHeight: theme.typography.body2.lineHeight,
          backgroundColor: 'background.default',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          transition: 'border-color 0.1s, box-shadow 0.1s',

          '&.Mui-focused': {
            borderColor: 'primary.main',
            borderWidth: 2,
            boxShadow: `${theme.shadows[0]}`,
          },
        },
        '& input': {
          textAlign: 'center',
        },
      }}
      slotProps={{
        input: {
          disableUnderline: true,
          inputMode: 'numeric',
          type: 'tel',
          startAdornment: (
            <InputAdornment
              position="start"
              sx={{
                bgcolor: 'action.hover',
                maxBlockSize: '100%',
              }}
            >
              <IconButton
                onClick={handleDecrement}
                sx={{
                  borderTopLeftRadius: 1,
                  borderBottomLeftRadius: 1,
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                }}
              >
                <RemoveIcon />
              </IconButton>
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end" sx={{ bgcolor: 'action.hover', maxBlockSize: '100%' }}>
              <IconButton
                onClick={handleIncrement}
                sx={{
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                  borderTopRightRadius: 1,
                  borderBottomRightRadius: 1,
                }}
              >
                <AddIcon />
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
