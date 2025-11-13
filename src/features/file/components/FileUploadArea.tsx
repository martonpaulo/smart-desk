'use client';

import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Image from 'next/image';
import { ChangeEvent, DragEvent } from 'react';

import type { File as AppFile } from 'src/features/file/types/File';

interface FileUploadAreaProps {
  file: File | null;
  preview: string | null;
  loading: boolean;
  error: boolean;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
  onUpload: () => Promise<AppFile>;
  onSaveToSupabase?: (file: AppFile) => void | Promise<void>;
}

export function FileUploadArea({
  file,
  preview,
  loading,
  error,
  onFileChange,
  onDrop,
  onUpload,
  onSaveToSupabase,
}: FileUploadAreaProps) {
  const handleUpload = async () => {
    const uploaded = await onUpload();
    if (onSaveToSupabase) {
      await onSaveToSupabase(uploaded);
    }
  };

  const renderPreview = () => {
    if (!file || !preview) return null;
    if (file.type.startsWith('image/')) {
      return (
        <Image
          src={preview}
          alt="Preview"
          width={200}
          height={200}
          style={{ objectFit: 'cover' }}
        />
      );
    }
    if (file.type.startsWith('video/')) {
      return <video src={preview} controls style={{ maxWidth: 200 }} />;
    }
    return (
      <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
        <InsertDriveFileIcon />
        <Typography variant="body2">{file.name}</Typography>
      </Box>
    );
  };

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
        id="file-upload-input"
        type="file"
        onChange={onFileChange}
        style={{ display: 'none' }}
      />
      {preview && (
        <Box mb={2} display="flex" justifyContent="center">
          {renderPreview()}
        </Box>
      )}
      <label htmlFor="file-upload-input">
        <Button variant="contained" component="span" disabled={loading}>
          Choose file
        </Button>
      </label>
      <Button variant="outlined" sx={{ ml: 2 }} onClick={handleUpload} disabled={!file || loading}>
        Upload
      </Button>
      {loading && <CircularProgress size={24} sx={{ ml: 2 }} />}
      {error && (
        <Typography color="error" mt={1}>
          Failed to upload file
        </Typography>
      )}
    </Box>
  );
}
