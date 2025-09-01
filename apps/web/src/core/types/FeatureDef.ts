import { SyncInterval } from 'src/core/constants/SyncInterval';

export interface FeatureDef {
  key: string;
  routes?: string[];
  exportName: string;
  interval: SyncInterval;
  loader: () => Promise<Record<string, unknown>>;
}
