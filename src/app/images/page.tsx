import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { CloudinaryImageManager } from '@/features/image/components/CloudinaryImageManager';

export default function ImagesPage() {
  function handleSelect(url: string) {
    console.log('Selected image:', url);
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Images
      </Typography>
      <CloudinaryImageManager onSelect={handleSelect} />
    </Box>
  );
}
