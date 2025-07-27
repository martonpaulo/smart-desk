import HotelIcon from '@mui/icons-material/Hotel';
import NightsStayOutlinedIcon from '@mui/icons-material/NightsStayOutlined';
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined';
import WbTwilightOutlinedIcon from '@mui/icons-material/WbTwilightOutlined';
import { Stack, Typography } from '@mui/material';

import { IWeather } from '@/legacy/types/IWeather';

interface ClockProps {
  currentTime: Date;
  weather: IWeather;
}

export function Clock({ currentTime, weather }: ClockProps) {
  const hour = currentTime.getHours();
  const minute = currentTime.getMinutes();

  const hour12 = hour % 12 || 12;
  const ampm = hour < 12 ? 'am' : 'pm';

  const formattedDate = currentTime.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const { apparentTemperature, relativeHumidity } = weather;

  let PhaseIcon = HotelIcon;
  if (hour >= 6 && hour < 12) PhaseIcon = WbTwilightOutlinedIcon;
  else if (hour >= 12 && hour < 18) PhaseIcon = WbSunnyOutlinedIcon;
  else if (hour >= 18) PhaseIcon = NightsStayOutlinedIcon;

  return (
    <Stack>
      <Stack direction="row" alignItems="baseline" justifyContent="center">
        <Typography variant="h1" mr={0.5}>
          {hour12}:{`${minute}`.padStart(2, '0')}
        </Typography>
        <Typography variant="h2">{ampm}</Typography>
        <Stack alignSelf="start">
          <PhaseIcon />
        </Stack>
      </Stack>

      <Stack direction="row" justifyContent="space-between" gap={1.5} alignItems="center">
        <Typography variant="subtitle1">{formattedDate}</Typography>

        <Typography variant="caption">
          {apparentTemperature}/{relativeHumidity}
        </Typography>
      </Stack>
    </Stack>
  );
}
