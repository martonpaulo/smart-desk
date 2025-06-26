import { createContext } from 'react';

import { ILocation } from '@/types/ILocation';

export const LocationContext = createContext<ILocation | null>(null);
