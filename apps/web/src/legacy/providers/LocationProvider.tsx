'use client';

import React, { useEffect, useState } from 'react';

import { LocationContext } from 'src/legacy/context/LocationContext';
import { ILocation } from 'src/legacy/types/ILocation';

interface LocationProviderProps {
  children: React.ReactNode;
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
        // Log geolocation errors as warnings to avoid failing headless tests
        console.warn('Geolocation error:', err);
      },
    );
  }, []);

  return <LocationContext.Provider value={location}>{children}</LocationContext.Provider>;
}
