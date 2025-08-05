'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardMedia from '@mui/material/CardMedia';
import Pagination from '@mui/material/Pagination';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Image from 'next/image';

import type { CloudinaryImage } from '@/features/image/types/CloudinaryImage';

interface ImageGalleryProps {
  images: CloudinaryImage[];
  selected: CloudinaryImage | null;
  onSelect: (img: CloudinaryImage) => void;
  page: number;
  pageSize: number;
  onPageChange: (_: React.ChangeEvent<unknown>, value: number) => void;
  loading: boolean;
  error: boolean;
}

export function ImageGallery({
  images,
  selected,
  onSelect,
  page,
  pageSize,
  onPageChange,
  loading,
  error,
}: ImageGalleryProps) {
  const count = Math.ceil(images.length / pageSize);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paged = images.slice(start, end);

  if (loading) {
    return (
      <Stack spacing={1}>
        <Skeleton variant="rectangular" width="100%" height={200} />
        <Stack direction="row" justifyContent="center">
          <Pagination count={count} page={page} onChange={onPageChange} />
        </Stack>
      </Stack>
    );
  }

  if (error) {
    return <Alert severity="error">Failed to load images</Alert>;
  }

  return (
    <Box>
      <Box
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(2,1fr)',
          sm: 'repeat(3,1fr)',
          md: 'repeat(4,1fr)',
        }}
        gap={2}
      >
        {paged.map(img => (
          <Card
            key={img.publicId}
            elevation={selected?.publicId === img.publicId ? 4 : 1}
            sx={{
              border: selected?.publicId === img.publicId ? '2px solid' : 'none',
              borderColor: 'primary.main',
            }}
          >
            <CardActionArea onClick={() => onSelect(img)}>
              <CardMedia
                component={() => (
                  <Image
                    src={img.url}
                    alt={img.publicId}
                    width={200}
                    height={200}
                    style={{ objectFit: 'cover' }}
                    loading="lazy"
                  />
                )}
              />
            </CardActionArea>
          </Card>
        ))}
      </Box>
      <Stack alignItems="center" mt={2}>
        <Pagination count={count} page={page} onChange={onPageChange} />
      </Stack>
    </Box>
  );
}
