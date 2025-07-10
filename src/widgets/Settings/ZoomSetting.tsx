import { Slider, Stack, Typography } from '@mui/material';

import { useUiPrefsStore } from '@/store/uiPrefsStore';

export function ZoomSetting() {
  const zoom = useUiPrefsStore(state => state.zoom);
  const setZoom = useUiPrefsStore(state => state.setZoom);

  const handleChange = (_event: Event, value: number | number[]) => {
    if (typeof value === 'number') setZoom(value);
  };

  return (
    <Stack spacing={2} sx={{ p: 1 }}>
      <Typography>Zoom: {Math.round(zoom * 100)}%</Typography>
      <Slider value={zoom} min={0.5} max={2} step={0.1} onChange={handleChange} />
    </Stack>
  );
}
