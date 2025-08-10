export interface FeatureDef {
  key: string;
  routes?: string[]; // Empty or omitted = always sync
  module: string;
  exportName: string;
  interval: number;
}
