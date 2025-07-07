import { Button, FormControlLabel, Switch } from '@mui/material';
import { useTodoPrefsStore } from '@/store/todoPrefsStore';

export function TodoSettings() {
  const view = useTodoPrefsStore(state => state.view);
  const setView = useTodoPrefsStore(state => state.setView);
  const setTrashOpen = useTodoPrefsStore(state => state.setTrashOpen);

  return (
    <>
      <FormControlLabel
        control={<Switch checked={view === 'board'} onChange={() => setView(view === 'board' ? 'list' : 'board')} />}
        label={view === 'board' ? 'Board view' : 'List view'}
      />
      <Button variant="outlined" onClick={() => setTrashOpen(true)} sx={{ ml: 2 }}>
        Trash
      </Button>
    </>
  );
}
