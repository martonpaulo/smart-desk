'use client';

import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import { FileGallery } from '@/features/file/components/FileGallery';
import { FileUploadArea } from '@/features/file/components/FileUploadArea';
import { useFiles,useSaveFile, useUploadFile } from '@/features/file/hooks/useFile';
import type { File as AppFile } from '@/features/file/types/File';

interface FileManagerProps {
  onSelect: (url: string) => void;
}

export function FileManager({ onSelect }: FileManagerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selected, setSelected] = useState<AppFile | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const filesQuery = useFiles('image');
  const uploadMutation = useUploadFile();
  const saveFileMutation = useSaveFile();
  const files = filesQuery.data?.pages.flatMap(p => p.files) ?? [];

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

  const handleUpload = async (): Promise<AppFile> => {
    if (!file) throw new Error('No file');
    const resourceType: AppFile['resourceType'] = file.type.startsWith('video/')
      ? 'video'
      : file.type.startsWith('image/')
        ? 'image'
        : 'raw';
    const result = await uploadMutation.mutateAsync({ file, resourceType });
    return result.file;
  };
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
        onSaveToSupabase={f => saveFileMutation.mutate({ file: f })}
      />
      <FileGallery
        files={files}
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
