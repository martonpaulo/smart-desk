import { useContext } from 'react';

import { useQuery } from '@tanstack/react-query';

import { LocationContext } from '@/context/LocationContext';
import { fetchGeolocation } from '@/services/geolocationService';

export function useLocation() {
  const location = useContext(LocationContext);
  const latitude = location?.latitude;
  const longitude = location?.longitude;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['location', latitude, longitude],
    queryFn: () => fetchGeolocation({ latitude, longitude }),
  });

  return {
    name: data?.name,
    latitude,
    longitude,
    isLoading,
    isError,
    error,
  };
}
