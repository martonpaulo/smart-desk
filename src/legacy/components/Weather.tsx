import { Alert, CircularProgress, Stack, Typography } from '@mui/material';

import { IWeather } from '@/legacy/types/IWeather';
import { formattedTime } from '@/legacy/utils/eventUtils';

export interface WeatherProps {
  locationName?: string | null;
  weather?: IWeather | null;
  weatherIsLoading: boolean;
  weatherIsError: boolean;
  weatherError: Error | null;
  showCaption?: boolean;
}

export function Weather({
  locationName,
  weather,
  weatherIsLoading,
  weatherIsError,
  weatherError,
  showCaption = true,
}: WeatherProps) {
  if (weatherIsLoading) return <CircularProgress />;

  const errorMessage = weatherError?.message || 'Failed to load weather data.';
  if (weatherIsError || !weather) return <Alert severity="error">{errorMessage}</Alert>;

  const { apparentTemperature, relativeHumidity, time } = weather;
  const lastTime = formattedTime(time);
  const caption = `${locationName ? locationName : 'Updated at'} ${lastTime}`;

  return (
    <Stack>
      <Stack direction="row" spacing={0.25} alignItems="baseline">
        <Typography variant="subtitle1">{apparentTemperature}</Typography>
        <Typography variant="caption">/{relativeHumidity}</Typography>
      </Stack>
      {showCaption && <Typography variant="caption">{caption}</Typography>}
    </Stack>
  );
}
