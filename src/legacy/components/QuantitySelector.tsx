import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { alpha } from '@mui/material/styles';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import { ChangeEvent, FocusEvent, KeyboardEvent, useCallback, useEffect, useState } from 'react';

import { formatValue, parseValue } from 'src/legacy/utils/stringUtils';
import { theme } from 'src/theme';

export interface QuantitySelectorProps extends Omit<TextFieldProps, 'value' | 'onChange'> {
  value: number | null;
  onValueChange: (value: number) => void;
  step?: number;
  minValue?: number;
  maxValue?: number;
  formatFn?: (value: number) => string;
  parseFn?: (str: string) => number;
  suffix?: string;
  singularSuffix?: string;
  hasSpace?: boolean;
  placeholder?: string;
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
  placeholder,
  ...props
}: QuantitySelectorProps) {
  // format display or return empty on null to show placeholder
  const formatDisplay = useCallback(
    (val: number | null) =>
      val === null
        ? ''
        : (formatFn ?? (v => formatValue(v, suffix, singularSuffix, hasSpace)))(val),
    [formatFn, suffix, singularSuffix, hasSpace],
  );

  // keep local text state
  const [displayValue, setDisplayValue] = useState<string>(formatDisplay(value));

  // sync when external value changes
  useEffect(() => {
    setDisplayValue(formatDisplay(value));
  }, [value, formatDisplay]);

  // apply min/max bounds safely
  const clamp = (v: number) => Math.min(Math.max(v, minValue), maxValue);

  // commit user input back to number
  const commitDisplayValue = () => {
    const parsed = parseFn(displayValue);
    const clamped = clamp(parsed);
    onValueChange(clamped);
  };

  // step calculations
  const getNextStepUp = (v: number) => {
    const rem = v % step;
    return clamp(rem === 0 ? v + step : v + (step - rem));
  };
  const getNextStepDown = (v: number) => {
    const rem = v % step;
    return clamp(rem === 0 ? v - step : v - rem);
  };

  // treat null as minValue for increments
  const handleIncrement = () => {
    if (props.disabled) return;
    const base = value ?? minValue;
    onValueChange(getNextStepUp(base));
  };
  const handleDecrement = () => {
    if (props.disabled) return;
    const base = value ?? minValue;
    onValueChange(getNextStepDown(base));
  };

  // keyboard handlers
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commitDisplayValue();
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
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
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDisplayValue(e.target.value);
  };

  return (
    <TextField
      {...props}
      variant="standard"
      value={displayValue}
      placeholder={placeholder}
      onChange={handleInputChange}
      onBlur={commitDisplayValue}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      fullWidth={false}
      sx={{
        ...props.sx,
        width: 170,
        '& .MuiInputBase-root': {
          height: theme.spacing(5),
          fontSize: theme.typography.body2.fontSize,
          fontWeight: theme.typography.body2.fontWeight,
          lineHeight: theme.typography.body2.lineHeight,
          backgroundColor: 'background.default',
          border: '1px solid',
          borderRadius: 1,
          borderColor: alpha(theme.palette.text.primary, 0.23),
          transition: 'border-color 0.1s, box-shadow 0.1s',
          '&:hover': {
            borderColor: alpha(theme.palette.text.primary, 0.87),
          },
          '&.Mui-focused': {
            borderColor: theme.palette.primary.main,
            borderWidth: 2,
            boxShadow: theme.shadows[0],
          },
          '&.Mui-error': {
            borderColor: theme.palette.error.main,
          },
          '&.Mui-disabled': {
            borderColor: alpha(theme.palette.text.primary, 0.12),
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
            <InputAdornment position="start" sx={{ bgcolor: 'action.hover', maxBlockSize: '100%' }}>
              <IconButton
                onClick={handleDecrement}
                sx={{
                  cursor: props.disabled ? 'not-allowed' : 'pointer',
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
                  cursor: props.disabled ? 'not-allowed' : 'pointer',
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
