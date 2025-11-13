import { createContext } from 'react';

import { ILocation } from 'src/legacy/types/ILocation';

export const LocationContext = createContext<ILocation | null>(null);
