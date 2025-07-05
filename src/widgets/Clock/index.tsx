import ThermostatIcon from '@mui/icons-material/Thermostat';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import { Stack, Typography } from '@mui/material';

import { IWeather } from '@/types/IWeather';

interface ClockProps {
  currentTime: Date;
  weather: IWeather;
}

export function Clock({ currentTime, weather }: ClockProps) {
  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const formattedDate = currentTime.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const { apparentTemperature, relativeHumidity } = weather;

  return (
    <Stack>
      <Typography variant="h1">{formattedTime}</Typography>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="subtitle1">{formattedDate}</Typography>

        <Stack direction="row" gap={0.75} alignItems="baseline">
          <Typography variant="subtitle1">
            <ThermostatIcon fontSize="inherit" />
            {apparentTemperature}
          </Typography>

          <Typography variant="caption">
            <WaterDropOutlinedIcon fontSize="inherit" />
            {relativeHumidity}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );
}
