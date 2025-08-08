import { useEffect } from 'react';

import { create } from 'zustand';

interface ActiveFeaturesState {
  features: Set<string>;
  activate(feature: string): void;
  deactivate(feature: string): void;
}

export const useActiveFeaturesStore = create<ActiveFeaturesState>(set => ({
  features: new Set<string>(),
  activate: feature => set(state => ({ features: new Set(state.features).add(feature) })),
  deactivate: feature =>
    set(state => {
      const next = new Set(state.features);
      next.delete(feature);
      return { features: next };
    }),
}));

export function useRegisterFeature(feature: string): void {
  const activate = useActiveFeaturesStore(state => state.activate);
  const deactivate = useActiveFeaturesStore(state => state.deactivate);
  useEffect(() => {
    activate(feature);
    return () => deactivate(feature);
  }, [activate, deactivate, feature]);
}
