import { NextRequest, NextResponse } from 'next/server';

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

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Next.js app', // Nominatim exige um User-Agent
      },
    });
    if (!res.ok) {
      throw new Error(`Geocoding failed: ${res.statusText}`);
    }

    const data = await res.json();
    const name = data.name;
    const addr = data.address || {};

    const city =
      addr.city ??
      addr.town ??
      addr.village ??
      addr.county ??
      addr.municipality ??
      addr.state ??
      name ??
      addr.region ??
      addr.country ??
      null;

    const locationName = city.trim();

    return NextResponse.json({ name: locationName });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'could not fetch location' }, { status: 500 });
  }
}
