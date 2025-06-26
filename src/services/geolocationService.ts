export interface GeolocationData {
  name: string | null;
}

export async function fetchGeolocation(params: {
  latitude?: number;
  longitude?: number;
}): Promise<GeolocationData> {
  const { latitude, longitude } = params;
  if (latitude == null || longitude == null) {
    throw new Error('Coordinates not provided');
  }

  const res = await fetch(`/api/nominatim-location?latitude=${latitude}&longitude=${longitude}`);
  if (!res.ok) {
    throw new Error(`Location fetch failed: ${res.statusText}`);
  }
  return res.json();
}
