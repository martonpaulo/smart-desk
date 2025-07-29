import { KeyboardEvent,useCallback, useMemo } from 'react';

type EventType = 'ctrlEnter' | 'enter' | 'escape' | 'blur';
type ActionName = 'save' | 'close' | 'none';

// This hook allows you to define custom actions for keyboard
// events in a modal input context, making it easier to handle
// user interactions consistently across your application

interface Config {
  onSave: () => void;
  onClose?: () => void;
  onNone?: () => void;
  mapping?: Partial<Record<EventType, ActionName>>;
}

const defaultMapping: Record<EventType, ActionName> = {
  ctrlEnter: 'save',
  escape: 'save',
  enter: 'none',
  blur: 'save',
};

export function useModalInputActions({
  onSave,
  onClose = () => {},
  onNone = () => {},
  mapping = {},
}: Config) {
  const merged = useMemo(() => ({ ...defaultMapping, ...mapping }), [mapping]);
  const callbacks = useMemo<Record<ActionName, () => void>>(
    () => ({
      save: onSave,
      close: onClose,
      none: onNone,
    }),
    [onSave, onClose, onNone],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      let type: EventType | null = null;

      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) type = 'ctrlEnter';
      else if (e.key === 'Escape') type = 'escape';
      else if (e.key === 'Enter') type = 'enter';
      else return;

      const action = merged[type];
      if (action === 'none') return;

      e.preventDefault();
      callbacks[action]();
    },
    [merged, callbacks],
  );

  const handleBlur = useCallback(() => {
    const action = merged.blur;
    if (action === 'none') return;
    callbacks[action]();
  }, [merged, callbacks]);

  return { handleKeyDown, handleBlur };
}

// Usage Example:

// const { handleKeyDown, handleBlur } = useModalInputActions({
//   onSave: () => saveValue(value),
//   onClose: closeModal,
//   mapping: {
//     enter: 'none',
//     blur: 'close',
//   },
// });

// <TextField
// 	{...props}
// 	onKeyDown={handleKeyDown}
// 	onBlur={handleBlur}
// />
