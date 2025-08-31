import { createContext } from 'react';

import { ILocation } from '@/legacy/types/ILocation';

export const LocationContext = createContext<ILocation | null>(null);
