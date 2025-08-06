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
import { File } from '@/features/file/types/File';
import { uploadImage } from '@/features/image/api/imageApi';
import { useCloudinaryImagesStore } from '@/features/image/store/useCloudinaryImagesStore';
import { uploadMapFile } from '@/features/map/api/mapApi';
import { useMapsStore } from '@/features/map/store/useMapsStore';
import type { MapRecord } from '@/features/map/types/MapRecord';

interface MapCreateDialogProps {
  open: boolean;
  onClose: () => void;
}

export function MapCreateDialog({ open, onClose }: MapCreateDialogProps) {
  const addMap = useMapsStore(s => s.add);
  const addCloudImage = useCloudinaryImagesStore(s => s.add);

  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [geoJson, setGeoJson] = useState<GeoJSON.FeatureCollection | null>(null);
  const [cloudImage, setCloudImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!open) {
      setName('');
      setFile(null);
      setPreview(null);
      setGeoJson(null);
      setCloudImage(null);
      setUploading(false);
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
      // GeoJSON file
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
    } else {
      setPreview(URL.createObjectURL(f));
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

  const handleUploadImage = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadImage(file);
      setCloudImage(result);
      addCloudImage({ ...result, createdAt: new Date() });
      setError(false);
    } catch {
      setError(true);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!file || !name) return;
    setUploading(true);
    try {
      const fileUrl = await uploadMapFile(file);
      const newMap: Omit<MapRecord, 'id' | 'trashed' | 'updatedAt' | 'isSynced'> = {
        name,
        fileUrl,
        geoJson: geoJson || undefined,
        regionColors: {},
        regionLabels: {},
        regionTooltips: {},
        createdAt: new Date(),
      };
      addMap(newMap as MapRecord);
      onClose();
    } catch {
      setError(true);
    } finally {
      setUploading(false);
    }
  };

  const isImage = !!preview;

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
          {isImage ? (
            <FileUploadArea
              file={file}
              preview={preview}
              loading={uploading}
              error={error}
              onFileChange={handleFileChange}
              onDrop={handleDrop}
              onUpload={handleUploadImage}
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
          disabled={!name || !file || (isImage && !cloudImage) || uploading}
          variant="contained"
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
