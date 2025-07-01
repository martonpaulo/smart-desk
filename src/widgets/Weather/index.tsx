import { Alert, CircularProgress, Stack, Typography } from '@mui/material';

import { IWeather } from '@/types/IWeather';
import { formattedTime } from '@/utils/eventUtils';

export interface WeatherProps {
  locationName?: string | null;
  weather?: IWeather | null;
  weatherIsLoading: boolean;
  weatherIsError: boolean;
  weatherError: Error | null;
}

export function Weather({
  locationName,
  weather,
  weatherIsLoading,
  weatherIsError,
  weatherError,
}: WeatherProps) {
  if (weatherIsLoading) return <CircularProgress />;

  const errorMessage = weatherError?.message || 'Failed to load weather data.';
  if (weatherIsError || !weather) return <Alert severity="error">{errorMessage}</Alert>;

  const { apparentTemperature, relativeHumidity, time } = weather;
  const lastTime = formattedTime(time);
  const caption = `${locationName ? locationName : 'Updated at'} ${lastTime}`;

  return (
    <Stack>
      <Stack direction="row" spacing={1} alignItems="baseline">
        <Typography variant="h4">{apparentTemperature}</Typography>
        <Typography>{relativeHumidity}</Typography>
      </Stack>
      <Typography variant="caption">{caption}</Typography>
    </Stack>
  );
}
