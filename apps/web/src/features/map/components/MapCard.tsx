import Image from 'next/image';
import Link from 'next/link';

import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { Card, CardActionArea, CardContent, Stack, Typography } from '@mui/material';
import type { File } from 'src/features/file/types/File';
import type { MapRecord } from 'src/features/map/types/MapRecord';

interface MapCardProps {
  map: MapRecord;
  file?: File;
}

export function MapCard({ map, file }: MapCardProps) {
  const renderPreview = () => {
    if (file?.resourceType === 'video') {
      return <video src={map.fileUrl} style={{ width: '100%' }} />;
    }
    if (file?.resourceType === 'image') {
      return (
        <Image
          src={map.fileUrl}
          alt={map.name}
          width={300}
          height={200}
          style={{ width: '100%', height: 'auto' }}
        />
      );
    }
    return (
      <Stack alignItems="center" py={2}>
        <InsertDriveFileIcon />
        <Typography variant="body2" mt={1}>
          {map.filePublicId}
        </Typography>
      </Stack>
    );
  };

  return (
    <Card variant="outlined" sx={{ width: 300 }}>
      <CardActionArea component={Link} href={`/maps/${map.id}`} sx={{ height: '100%' }}>
        {renderPreview()}
        <CardContent>
          <Stack gap={1}>
            <Typography variant="h3" noWrap>
              {map.name}
            </Typography>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
