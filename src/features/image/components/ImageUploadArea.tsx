'use client';

import { ChangeEvent, DragEvent } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Image from 'next/image';

interface ImageUploadAreaProps {
  file: File | null;
  preview: string | null;
  loading: boolean;
  error: boolean;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
  onUpload: () => void;
}

export function ImageUploadArea({
  file,
  preview,
  loading,
  error,
  onFileChange,
  onDrop,
  onUpload,
}: ImageUploadAreaProps) {
  return (
    <Box
      onDragOver={e => e.preventDefault()}
      onDrop={onDrop}
      sx={{
        border: '1px dashed',
        borderColor: 'divider',
        borderRadius: 1,
        p: 2,
        mb: 2,
        textAlign: 'center',
      }}
    >
      <input
        id="image-upload-input"
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={onFileChange}
      />
      {preview && (
        <Box mb={2} display="flex" justifyContent="center">
          <Image
            src={preview}
            alt="Preview"
            width={200}
            height={200}
            style={{ objectFit: 'cover' }}
          />
        </Box>
      )}
      <label htmlFor="image-upload-input">
        <Button variant="contained" component="span" disabled={loading}>
          Choose file
        </Button>
      </label>
      <Button variant="outlined" sx={{ ml: 2 }} onClick={onUpload} disabled={!file || loading}>
        Upload
      </Button>
      {loading && <CircularProgress size={24} sx={{ ml: 2 }} />}
      {error && (
        <Typography color="error" mt={1}>
          Failed to upload image
        </Typography>
      )}
    </Box>
  );
}
