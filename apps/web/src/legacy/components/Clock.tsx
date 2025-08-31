import HotelIcon from '@mui/icons-material/Hotel';
import NightsStayOutlinedIcon from '@mui/icons-material/NightsStayOutlined';
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined';
import WbTwilightOutlinedIcon from '@mui/icons-material/WbTwilightOutlined';
import { Stack, Typography } from '@mui/material';

import { useLocation } from '@/legacy/hooks/useLocation';
import { useWeather } from '@/legacy/hooks/useWeather';
import { useCurrentTime } from '@/shared/hooks/useCurrentTime';

export function Clock() {
  const { latitude, longitude } = useLocation();
  const { data: weather } = useWeather(latitude, longitude);

  const now = useCurrentTime();

  const hour = now.getHours();
  const minute = now.getMinutes();

  const hour12 = hour % 12 || 12;
  const meridiem = hour < 12 ? 'am' : 'pm';

  const formattedDate = now.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  let PhaseIcon = HotelIcon;
  if (hour >= 6 && hour < 12) PhaseIcon = WbTwilightOutlinedIcon;
  else if (hour >= 12 && hour < 18) PhaseIcon = WbSunnyOutlinedIcon;
  else if (hour >= 18) PhaseIcon = NightsStayOutlinedIcon;

  const showWeather = weather?.apparentTemperature && weather?.relativeHumidity;

  return (
    <Stack>
      <Stack direction="row" alignItems="baseline" justifyContent="center">
        <Typography variant="h1" mr={0.5}>
          {hour12}:{`${minute}`.padStart(2, '0')}
        </Typography>
        <Typography variant="h2">{meridiem}</Typography>
        <Stack alignSelf="start">
          <PhaseIcon />
        </Stack>
      </Stack>

      <Stack direction="row" justifyContent="space-between" gap={1.5} alignItems="center">
        <Typography variant="subtitle1">{formattedDate}</Typography>

        {showWeather ? (
          <Typography variant="caption">
            {weather.apparentTemperature}/{weather.relativeHumidity}
          </Typography>
        ) : null}
      </Stack>
    </Stack>
  );
}
