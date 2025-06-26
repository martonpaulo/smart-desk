'use client';

import { ReactNode, useEffect, useState } from 'react';

import { LocationContext } from '@/context/LocationContext';
import { ILocation } from '@/types/ILocation';

interface LocationProviderProps {
  children: ReactNode;
}

export function LocationProvider({ children }: LocationProviderProps) {
  const [location, setLocation] = useState<ILocation | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocation({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
      },
      err => {
        console.error('Geolocation error:', err);
      },
    );
  }, []);

  return <LocationContext.Provider value={location}>{children}</LocationContext.Provider>;
}
