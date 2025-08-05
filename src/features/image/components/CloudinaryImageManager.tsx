import { useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';

import { listImages, uploadImage } from '@/features/image/api/imageApi';
import type { CloudinaryImage } from '@/features/image/types/CloudinaryImage';

interface CloudinaryImageManagerProps {
  onSelect: (imageUrl: string) => void;
}

export function CloudinaryImageManager({ onSelect }: CloudinaryImageManagerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selected, setSelected] = useState<CloudinaryImage | null>(null);
  const queryClient = useQueryClient();
  const theme = useTheme();
  const downSm = useMediaQuery(theme.breakpoints.down('sm'));
  const downMd = useMediaQuery(theme.breakpoints.down('md'));
  const cols = downSm ? 2 : downMd ? 3 : 4;

  const imagesQuery = useQuery({
    queryKey: ['cloudinary-images'],
    queryFn: listImages,
  });

  const uploadMutation = useMutation({
    mutationFn: uploadImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cloudinary-images'] });
      setFile(null);
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      setPreview(null);
    },
  });

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const chosenFile = event.target.files?.[0];
    if (chosenFile) {
      setFile(chosenFile);
      setPreview(URL.createObjectURL(chosenFile));
    }
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      setPreview(URL.createObjectURL(droppedFile));
    }
  }

  function handleUpload() {
    if (file) {
      uploadMutation.mutate(file);
    }
  }

  function confirmSelection() {
    if (selected) {
      onSelect(selected.url);
    }
  }

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  return (
    <Box>
      <Box
        sx={{
          border: '1px dashed',
          borderColor: 'divider',
          borderRadius: 1,
          p: 2,
          mb: 2,
          textAlign: 'center',
        }}
        onDragOver={event => event.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          id="image-upload-input"
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        {preview ? (
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
            <Image
              src={preview}
              alt="Preview"
              width={200}
              height={200}
              style={{ objectFit: 'cover' }}
            />
          </Box>
        ) : null}
        <label htmlFor="image-upload-input">
          <Button variant="contained" component="span" disabled={uploadMutation.isPending}>
            Choose File
          </Button>
        </label>
        <Button
          variant="outlined"
          sx={{ ml: 2 }}
          onClick={handleUpload}
          disabled={!file || uploadMutation.isPending}
        >
          Upload
        </Button>
        {uploadMutation.isPending && <CircularProgress size={24} sx={{ ml: 2 }} />}
        {uploadMutation.isError && (
          <Typography color="error" sx={{ mt: 1 }}>
            Failed to upload image.
          </Typography>
        )}
      </Box>

      {imagesQuery.isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : imagesQuery.isError ? (
        <Alert severity="error">Failed to load images.</Alert>
      ) : (
        <ImageList cols={cols} gap={8} sx={{ m: 0 }}>
          {imagesQuery.data?.map(image => (
            <ImageListItem
              key={image.publicId}
              onClick={() => setSelected(image)}
              sx={{
                cursor: 'pointer',
                border: selected?.publicId === image.publicId ? '2px solid' : 'none',
                borderColor: 'primary.main',
              }}
            >
              <Image
                src={image.url}
                alt={image.publicId}
                width={200}
                height={200}
                loading="lazy"
                style={{ objectFit: 'cover' }}
              />
            </ImageListItem>
          ))}
        </ImageList>
      )}

      <Box sx={{ textAlign: 'right', mt: 2 }}>
        <Button variant="contained" onClick={confirmSelection} disabled={!selected}>
          Select Image
        </Button>
      </Box>
    </Box>
  );
}
