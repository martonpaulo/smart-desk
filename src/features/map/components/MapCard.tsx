import { Card, CardActionArea, CardContent, Stack, Typography } from '@mui/material';
import Link from 'next/link';

import type { MapRecord } from '@/features/map/types/MapRecord';

interface MapCardProps {
  map: MapRecord;
}

export function MapCard({ map }: MapCardProps) {
  return (
    <Card variant="outlined" sx={{ width: 300 }}>
      <CardActionArea component={Link} href={`/maps/${map.id}`} sx={{ height: '100%' }}>
        <CardContent>
          <Stack gap={1}>
            <Typography variant="h6" noWrap>
              {map.name}
            </Typography>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
