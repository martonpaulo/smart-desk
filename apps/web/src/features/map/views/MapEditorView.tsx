'use client';

import { useState } from 'react';

import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { Button, CircularProgress, Drawer, Stack, TextField, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import type { FeatureCollection } from 'geojson';

import { PageSection } from '@/core/components/PageSection';
import { useFile } from '@/features/file/hooks/useFile';
import { useMapsStore } from '@/features/map/store/useMapsStore';
import type { MapRecord } from '@/features/map/types/MapRecord';
import { ColorPicker } from '@/shared/components/ColorPicker';

interface RegionPath {
  id: string;
  d: string;
}

function buildPathsWithSize(geo: FeatureCollection): {
  paths: RegionPath[];
  width: number;
  height: number;
} {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  const polys: Array<{ id: string; coords: number[][][] }> = [];

  geo.features.forEach((f, idx) => {
    const props = (f.properties as Record<string, unknown>) ?? {};
    const id = String(f.id ?? props.id ?? `region-${idx}`);
    let coords: number[][][] = [];
    if (f.geometry.type === 'Polygon') {
      coords = f.geometry.coordinates as number[][][];
    } else if (f.geometry.type === 'MultiPolygon') {
      coords = (f.geometry.coordinates as number[][][][]).flat();
    }
    coords.forEach(poly =>
      poly.forEach(([x, y]) => {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }),
    );
    polys.push({ id, coords });
  });

  const dataWidth = maxX - minX;
  const dataHeight = maxY - minY;
  const paths = polys.map(p => {
    const d = p.coords
      .map(
        poly =>
          poly
            .map(([x, y], i) => {
              // escala pra coordenada relativa
              const px = x - minX;
              const py = maxY - y;
              return `${i === 0 ? 'M' : 'L'}${px} ${py}`;
            })
            .join(' ') + ' Z',
      )
      .join(' ');
    return { id: p.id, d };
  });

  return { paths, width: dataWidth, height: dataHeight };
}

export function MapEditorView({ mapId }: { mapId: string }) {
  const map = useMapsStore(s => s.items.find(m => m.id === mapId));
  const updateMap = useMapsStore(s => s.update);

  const [selected, setSelected] = useState<string | null>(null);
  const [color, setColor] = useState('');
  const [label, setLabel] = useState('');
  const [tooltip, setTooltip] = useState('');

  // 2. fetch file metadata (we only accept raw = GeoJSON)
  const {
    data: file,
    isLoading: fileLoading,
    error: fileError,
  } = useFile(map?.filePublicId, 'raw');

  // 4. fetch GeoJSON content
  const {
    data: geoJson,
    isLoading: jsonLoading,
    error: jsonError,
  } = useQuery<FeatureCollection, Error>({
    queryKey: ['geojson', map?.filePublicId],
    queryFn: async () => {
      if (!file?.url) throw new Error('No file URL');
      const res = await fetch(file.url);
      if (!res.ok) {
        throw new Error(res.statusText || 'Failed to fetch GeoJSON');
      }
      return res.json() as Promise<FeatureCollection>;
    },
    enabled: !!file?.url,
  });

  // 1. handle missing map
  if (!map) {
    return (
      <PageSection title="Map">
        <Typography>Map not found</Typography>
      </PageSection>
    );
  }

  if (fileLoading) {
    return (
      <PageSection title={map.name}>
        <Stack alignItems="center" mt={4} gap={2}>
          <CircularProgress />
          <Typography>Loading file metadata</Typography>
        </Stack>
      </PageSection>
    );
  }

  if (fileError) {
    return (
      <PageSection title={map.name}>
        <Typography>Error loading file metadata: {fileError.message}</Typography>
      </PageSection>
    );
  }

  // 3. enforce GeoJSON only
  if (file?.resourceType !== 'raw') {
    return (
      <PageSection title={map.name}>
        <Stack alignItems="center" gap={1} mt={4}>
          <InsertDriveFileIcon fontSize="large" />
          <Typography variant="body2">
            Unsupported file type – please select a GeoJSON file
          </Typography>
        </Stack>
      </PageSection>
    );
  }

  if (jsonLoading) {
    return (
      <PageSection title={map.name}>
        <Stack alignItems="center" mt={4} gap={2}>
          <CircularProgress />
          <Typography>Loading GeoJSON data</Typography>
        </Stack>
      </PageSection>
    );
  }

  if (jsonError) {
    return (
      <PageSection title={map.name}>
        <Typography>Error loading map data: {jsonError.message}</Typography>
      </PageSection>
    );
  }

  // 5. render map
  const {
    paths,
    width: dataW,
    height: dataH,
  } = geoJson ? buildPathsWithSize(geoJson) : { paths: [], width: 0, height: 0 };

  return (
    <PageSection title={map.name} description="Click a region to edit its settings">
      <svg
        viewBox={`0 0 ${dataW} ${dataH}`}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        shapeRendering="geometricPrecision"
        style={{ display: 'block' }}
      >
        {paths.map(p => (
          <path
            key={p.id}
            d={p.d}
            fill={map.regionColors[p.id] || 'transparent'}
            stroke="#000"
            strokeWidth={0.2}
            onClick={() => {
              setSelected(p.id);
              setColor(map.regionColors[p.id] || '');
              setLabel(map.regionLabels[p.id] || '');
              setTooltip(map.regionTooltips[p.id] || '');
            }}
          />
        ))}
      </svg>

      <Drawer anchor="right" open={Boolean(selected)} onClose={() => setSelected(null)}>
        <Stack width={320} p={2} gap={2}>
          <Typography variant="h3">Region {selected}</Typography>
          <ColorPicker
            name="color"
            label="Color"
            value={color}
            onChange={e => setColor(e.target.value)}
          />
          <TextField
            label="Label"
            value={label}
            onChange={e => setLabel(e.target.value)}
            fullWidth
          />
          <TextField
            label="Tooltip"
            value={tooltip}
            onChange={e => setTooltip(e.target.value)}
            fullWidth
          />
          <Button
            variant="contained"
            onClick={() => {
              if (!selected) return;
              updateMap({
                id: map.id,
                updatedAt: new Date(),
                regionColors: {
                  ...map.regionColors,
                  [selected]: color,
                },
                regionLabels: {
                  ...map.regionLabels,
                  [selected]: label,
                },
                regionTooltips: {
                  ...map.regionTooltips,
                  [selected]: tooltip,
                },
              } as MapRecord);
              setSelected(null);
            }}
          >
            Save
          </Button>
        </Stack>
      </Drawer>
    </PageSection>
  );
}
