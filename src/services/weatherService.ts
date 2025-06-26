import { IWeather } from '@/types/IWeather';

interface FetchWeatherParams {
  latitude?: number;
  longitude?: number;
}

export async function fetchWeather(params: FetchWeatherParams): Promise<IWeather> {
  const { latitude, longitude } = params;

  if (latitude == null || longitude == null) {
    throw new Error('Latitude and longitude are required to fetch weather data.');
  }

  const endpoint = new URL('/api/openmeteo-weather', window.location.origin);
  endpoint.searchParams.set('latitude', latitude.toString());
  endpoint.searchParams.set('longitude', longitude.toString());

  const res = await fetch(endpoint.toString());

  if (!res.ok) {
    throw new Error(`Weather fetch failed: ${res.statusText}`);
  }

  return res.json();
}
