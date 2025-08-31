import { SyncInterval } from '@/core/constants/SyncInterval';

export interface FeatureDef {
  key: string;
  routes?: string[];
  exportName: string;
  interval: SyncInterval;
  loader: () => Promise<Record<string, unknown>>;
}
