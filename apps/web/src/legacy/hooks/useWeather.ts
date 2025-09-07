import { useQuery } from '@tanstack/react-query';
import { fetchWeather } from 'src/legacy/services/weatherService';

export function useWeather(latitude?: number, longitude?: number) {
  return useQuery({
    queryKey: ['weather', latitude, longitude],
    queryFn: () => fetchWeather({ latitude, longitude }),
    enabled: latitude != null && longitude != null,
    // API rate limit: 1 request every minute
    refetchInterval: 1000 * 60 * 5, // 5 minutes
  });
}
