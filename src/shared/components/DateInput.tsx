import { DateValidationError, PickerChangeHandlerContext } from '@mui/x-date-pickers';
import { DatePicker, DatePickerProps } from '@mui/x-date-pickers/DatePicker';
import { useEffect, useState } from 'react';

export function DateInput(props: DatePickerProps) {
  const { value, onChange, slotProps, ...rest } = props;
  const [cleared, setCleared] = useState(false);

  // convert undefined → null so the picker is always controlled
  const controlledValue = value ?? null;

  // wrap onChange to handle clear events
  const handleChange = (
    newValue: Date | null,
    context?: PickerChangeHandlerContext<DateValidationError>,
  ) => {
    if (newValue === null) setCleared(true);
    if (context) {
      onChange?.(newValue, context);
    }
  };

  // Reset cleared state after 1500ms
  useEffect(() => {
    if (!cleared) return;

    const timeout = setTimeout(() => {
      setCleared(false);
    }, 1500);

    return () => clearTimeout(timeout);
  }, [cleared]);

  return (
    <DatePicker
      {...rest}
      format="EEE, dd MMM/yy"
      value={controlledValue}
      onChange={handleChange}
      slotProps={{
        ...slotProps,
        field: {
          ...slotProps?.field,
          clearable: true,
          onClear: () => setCleared(true),
        },
        actionBar: {
          actions: ['cancel', 'clear', 'today', 'accept'],
        },
        textField: {
          ...(slotProps?.textField || {}),
          size: 'small',
        },
        // Make icons small
        openPickerButton: {
          ...(slotProps?.openPickerButton || {}),
          size: 'small',
        },
        clearButton: {
          ...(slotProps?.clearButton || {}),
          size: 'small',
        },
      }}
    />
  );
}
