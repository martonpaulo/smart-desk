'use client';

import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardMedia from '@mui/material/CardMedia';
import Pagination from '@mui/material/Pagination';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Image from 'next/image';

import type { File } from 'src/features/file/types/File';

interface FileGalleryProps {
  files: File[];
  selected: File | null;
  onSelectAction: (img: File) => void;
  page: number;
  pageSize: number;
  onPageChangeAction: (_: React.ChangeEvent<unknown>, value: number) => void;
  loading: boolean;
  error: boolean;
}

export function FileGallery({
  files,
  selected,
  onSelectAction,
  page,
  pageSize,
  onPageChangeAction,
  loading,
  error,
}: FileGalleryProps) {
  const count = Math.ceil(files.length / pageSize);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paged = files.slice(start, end);

  if (loading) {
    return (
      <Stack spacing={1}>
        <Skeleton variant="rectangular" width="100%" height={200} />
        <Stack direction="row" justifyContent="center">
          <Pagination count={count} page={page} onChange={onPageChangeAction} />
        </Stack>
      </Stack>
    );
  }

  if (error) {
    return <Alert severity="error">Failed to load files</Alert>;
  }

  return (
    <Box>
      <Box
        display="grid"
        gridTemplateColumns={{
          mobileSm: 'repeat(2,1fr)',
          mobileMd: 'repeat(3,1fr)',
          mobileLg: 'repeat(4,1fr)',
        }}
        gap={2}
      >
        {paged.map(f => (
          <Card
            key={f.publicId}
            elevation={selected?.publicId === f.publicId ? 4 : 1}
            sx={{
              border: selected?.publicId === f.publicId ? '2px solid' : 'none',
              borderColor: 'primary.main',
            }}
          >
            <CardActionArea onClick={() => onSelectAction(f)}>
              <CardMedia
                component={() => {
                  if (f.resourceType === 'image') {
                    return (
                      <Image
                        src={f.url}
                        alt={f.publicId}
                        width={200}
                        height={200}
                        style={{ objectFit: 'cover' }}
                        loading="lazy"
                      />
                    );
                  }
                  if (f.resourceType === 'video') {
                    return <video src={f.url} controls style={{ width: '100%' }} />;
                  }
                  return (
                    <Stack alignItems="center" p={2}>
                      <InsertDriveFileIcon />
                      <Typography variant="body2" mt={1}>
                        {f.publicId}
                      </Typography>
                    </Stack>
                  );
                }}
              />
            </CardActionArea>
          </Card>
        ))}
      </Box>
      <Stack alignItems="center" mt={2}>
        <Pagination count={count} page={page} onChange={onPageChangeAction} />
      </Stack>
    </Box>
  );
}
