import { FormControlLabel, Switch } from '@mui/material';

import { useTodoPrefsStore } from '@/store/todoPrefsStore';

export function TodoViewSettings() {
  const view = useTodoPrefsStore(state => state.view);
  const setView = useTodoPrefsStore(state => state.setView);

  return (
    <FormControlLabel
      control={
        <Switch
          checked={view === 'board'}
          onChange={() => setView(view === 'board' ? 'list' : 'board')}
        />
      }
      label={view === 'board' ? 'Board view' : 'List view'}
    />
  );
}
