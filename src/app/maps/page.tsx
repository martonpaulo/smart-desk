'use client';

import { useRegisterFeature } from '@/core/store/useActiveFeaturesStore';
import { MapsView } from '@/features/map/views/MapsView';

export default function MapsPage() {
  useRegisterFeature('maps');
  return <MapsView />;
}
