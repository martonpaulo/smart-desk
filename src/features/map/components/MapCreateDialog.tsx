'use client';

import { ChangeEvent, useEffect, useState } from 'react';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { FileUploadArea } from '@/features/file/components/FileUploadArea';
import { useSaveFile, useUploadFile } from '@/features/file/hooks/useFile';
import type { File as AppFile } from '@/features/file/types/File';
import { useMapsStore } from '@/features/map/store/useMapsStore';
import type { MapRecord } from '@/features/map/types/MapRecord';

interface MapCreateDialogProps {
  open: boolean;
  onClose: () => void;
}

export function MapCreateDialog({ open, onClose }: MapCreateDialogProps) {
  const addMap = useMapsStore(s => s.add);
  const uploadMutation = useUploadFile();
  const saveFileMutation = useSaveFile();

  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [resourceType, setResourceType] = useState<AppFile['resourceType']>('image');
  const [uploadedFile, setUploadedFile] = useState<AppFile | null>(null);
  const [geoJson, setGeoJson] = useState<GeoJSON.FeatureCollection | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!open) {
      setName('');
      setFile(null);
      setPreview(null);
      setGeoJson(null);
      setUploadedFile(null);
      setError(false);
    }
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [open, preview]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    setFile(f);
    if (f.type.includes('json') || f.name.endsWith('.geojson')) {
      const reader = new FileReader();
      reader.onload = ev => {
        try {
          const obj = JSON.parse(String(ev.target?.result));
          setGeoJson(obj);
        } catch {
          setGeoJson(null);
        }
      };
      reader.readAsText(f);
      setPreview(null);
      setResourceType('raw');
    } else {
      setPreview(URL.createObjectURL(f));
      if (f.type.startsWith('video/')) {
        setResourceType('video');
      } else {
        setResourceType('image');
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0] ?? null;
    if (f) {
      const event = { target: { files: [f] } } as unknown as ChangeEvent<HTMLInputElement>;
      handleFileChange(event);
    }
  };

  const handleUpload = async (): Promise<AppFile> => {
    if (!file) throw new Error('No file selected');
    const result = await uploadMutation.mutateAsync({ file, resourceType });
    setUploadedFile(result.file);
    setError(false);
    return result.file;
  };

  const handleSave = async () => {
    if (!uploadedFile || !name) return;
    const newMap: Omit<MapRecord, 'id' | 'trashed' | 'updatedAt' | 'isSynced'> = {
      name,
      filePublicId: uploadedFile.publicId,
      fileUrl: uploadedFile.url,
      geoJson: geoJson || undefined,
      regionColors: {},
      regionLabels: {},
      regionTooltips: {},
      createdAt: new Date(),
    };
    addMap(newMap as MapRecord);
    if (resourceType === 'image' || resourceType === 'video') {
      await saveFileMutation.mutateAsync({ file: uploadedFile });
    }
    onClose();
  };

  const hasPreview = Boolean(preview);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="mobileSm">
      <DialogTitle>New Map</DialogTitle>
      <DialogContent>
        <Stack gap={2} mt={1}>
          <TextField
            label="Map name"
            value={name}
            onChange={e => setName(e.target.value)}
            fullWidth
          />
          {hasPreview ? (
            <FileUploadArea
              file={file}
              preview={preview}
              loading={uploadMutation.isPending}
              error={uploadMutation.isError || error}
              onFileChange={handleFileChange}
              onDrop={handleDrop}
              onUpload={handleUpload}
            />
          ) : (
            <Stack>
              <input type="file" accept=".geojson,application/json" onChange={handleFileChange} />
              {file && (
                <Typography variant="body2" mt={1}>
                  {file.name}
                </Typography>
              )}
            </Stack>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          disabled={!name || !uploadedFile || uploadMutation.isPending}
          variant="contained"
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
