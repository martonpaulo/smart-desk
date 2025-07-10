import { Box, Button, Input, Stack, Typography } from '@mui/material';

import { useUiPrefsStore } from '@/store/uiPrefsStore';

export function ZoomSetting() {
  const zoom = useUiPrefsStore(state => state.zoom);
  const setZoom = useUiPrefsStore(state => state.setZoom);

  const resetZoom = () => {
    setZoom(1);
  };

  return (
    <Box>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ my: 1 }}>
        <Input
          type="number"
          value={Math.round(zoom * 100)}
          onChange={e => setZoom(Number(e.target.value) / 100)}
        />
        <Typography variant="body2">%</Typography>
      </Stack>
      <Button variant="outlined" size="small" onClick={resetZoom}>
        Reset Zoom
      </Button>
    </Box>
  );
}
