import { NextRequest, NextResponse } from 'next/server';
import { fetchWeatherApi } from 'openmeteo';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const lat = searchParams.get('latitude');
  const lon = searchParams.get('longitude');

  if (!lat || !lon) {
    return NextResponse.json({ error: 'missing latitude or longitude' }, { status: 400 });
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);
  if (isNaN(latitude) || isNaN(longitude)) {
    return NextResponse.json({ error: 'invalid latitude or longitude' }, { status: 400 });
  }

  console.log(`Fetching weather for lat: ${latitude}, lon: ${longitude}`);

  try {
    const params = {
      latitude,
      longitude,
      current: ['relative_humidity_2m', 'apparent_temperature'] as const,
      forecast_days: 1,
    };
    const url = 'https://api.open-meteo.com/v1/forecast';
    const responses = await fetchWeatherApi(url, params);
    const response = responses[0];
    const utcOffset = response.utcOffsetSeconds();
    const current = response.current()!;

    const weatherData = {
      time: new Date((Number(current.time()) + utcOffset) * 1000).toISOString(),
      relativeHumidity: `${Math.round(current.variables(0)!.value())}%`, // in %
      apparentTemperature: `${Math.round(current.variables(1)!.value())}°C`, // in °C
    };

    return NextResponse.json(weatherData);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'could not fetch weather' }, { status: 500 });
  }
}
