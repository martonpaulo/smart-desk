'use client';

import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';
import { closeSnackbar, enqueueSnackbar } from 'notistack';

import { playInterfaceSound } from 'src/features/sound/utils/soundPlayer';
import { PromiseFeedback } from 'src/shared/types/PromiseFeedback';

export function useRunWithFeedback(deps: {
  add: (key?: string) => void;
  remove: (key?: string) => void;
}) {
  const { add, remove } = deps;

  function CloseBtn({ id }: { id: string | number }) {
    return (
      <IconButton onClick={() => closeSnackbar(id)} color="inherit" size="small" aria-label="Close">
        <CloseIcon fontSize="small" />
      </IconButton>
    );
  }

  function ActionButton({
    id,
    label,
    onClick,
  }: {
    id: string | number;
    label: string;
    onClick: () => Promise<void>;
  }) {
    return (
      <>
        <button
          onClick={onClick}
          style={{
            border: 0,
            background: 'transparent',
            color: 'inherit',
            cursor: 'pointer',
            fontWeight: 600,
            marginRight: 8,
          }}
        >
          {label}
        </button>
        <CloseBtn id={id} />
      </>
    );
  }

  async function runWithFeedback<T>(opts: PromiseFeedback<T>): Promise<T | undefined> {
    const { key, operation, successSound, errorMessage, onUndo, successMessage } = opts;

    add(key);

    try {
      const result = await operation();

      if (successSound) playInterfaceSound(successSound);

      enqueueSnackbar(successMessage, {
        variant: 'success',
        action: snackbarId =>
          onUndo ? (
            <ActionButton
              id={snackbarId}
              label="Undo"
              onClick={async () => {
                try {
                  await onUndo();
                  closeSnackbar(snackbarId);
                } catch (undoErr) {
                  console.error('Undo failed', undoErr);
                  playInterfaceSound('error');
                  enqueueSnackbar('Undo failed', {
                    variant: 'error',
                    action: id => <CloseBtn id={id} />,
                  });
                }
              }}
            />
          ) : (
            <CloseBtn id={snackbarId} />
          ),
      });

      return result;
    } catch (err) {
      console.error('runWithFeedback error', err);
      playInterfaceSound('error');

      enqueueSnackbar(errorMessage, {
        variant: 'error',
        action: snackbarId => (
          <ActionButton
            id={snackbarId}
            label="Redo"
            onClick={async () => {
              try {
                await runWithFeedback<T>({ ...opts });
                closeSnackbar(snackbarId);
              } catch (redoErr) {
                console.error('Redo failed', redoErr);
                playInterfaceSound('error');
                enqueueSnackbar('Redo failed', {
                  variant: 'error',
                  action: id => <CloseBtn id={id} />,
                });
              }
            }}
          />
        ),
      });

      return undefined;
    } finally {
      remove(key);
    }
  }

  return { runWithFeedback };
}
