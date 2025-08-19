import { InterfaceSound } from '@/features/sound/types/InterfaceSound';

export interface PromiseFeedback<T> {
  key: string;
  operation: () => Promise<T>;
  successSound?: InterfaceSound;
  successMessage: string;
  errorMessage: string;
  onUndo?: () => Promise<void> | void;
}
