import { useContext } from 'react';

import { LocationContext } from '@/context/LocationContext';

export function useLocation() {
  const location = useContext(LocationContext);
  const latitude = location?.latitude;
  const longitude = location?.longitude;

  return {
    latitude,
    longitude,
  };
}
