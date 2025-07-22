'use client';

import { Box } from '@mui/material';
import { YearCalendar } from '@mui/x-date-pickers/YearCalendar';

interface YearViewProps {
  date: Date;
  onChange: (date: Date) => void;
}

export function YearView({ date, onChange }: YearViewProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <YearCalendar
        value={date}
        onChange={newDate => {
          if (newDate) onChange(newDate as Date);
        }}
      />
    </Box>
  );
}
