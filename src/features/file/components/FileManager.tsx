'use client';

import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import { FileGallery } from '@/features/file/components/FileGallery';
import { FileUploadArea } from '@/features/file/components/FileUploadArea';
import type { File } from '@/features/file/types/File';

interface FileManagerProps {
  onSelect: (url: string) => void;
}

export function FileManager({ onSelect }: FileManagerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selected, setSelected] = useState<File | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const d = e.dataTransfer.files?.[0] ?? null;
    if (d) {
      setFile(d);
      setPreview(URL.createObjectURL(d));
    }
  };

  const handleUpload = () => file && uploadMutation.mutate(file);
  const handlePageChange = (_: React.ChangeEvent<unknown>, v: number) => setPage(v);
  const confirmSelection = () => selected && onSelect(selected.url);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <Box>
      <FileUploadArea
        file={file}
        preview={preview}
        loading={uploadMutation.isPending}
        error={uploadMutation.isError}
        onFileChange={handleFileChange}
        onDrop={handleDrop}
        onUpload={handleUpload}
      />
      <FileGallery
        files={filesQuery.data ?? []}
        selected={selected}
        onSelect={setSelected}
        page={page}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        loading={filesQuery.isLoading}
        error={filesQuery.isError}
      />
      <Box textAlign="right" mt={2}>
        <Button variant="contained" disabled={!selected} onClick={confirmSelection}>
          Select file
        </Button>
      </Box>
    </Box>
  );
}
