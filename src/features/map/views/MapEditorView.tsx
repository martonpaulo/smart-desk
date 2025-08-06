'use client';

import { useState } from 'react';

import { Button, Drawer, Stack, TextField, Typography } from '@mui/material';

import { PageSection } from '@/core/components/PageSection';
import { useMapsStore } from '@/features/map/store/useMapsStore';
import type { MapRecord } from '@/features/map/types/MapRecord';
import { ColorPicker } from '@/shared/components/ColorPicker';

interface MapEditorViewProps {
  mapId: string;
}

interface RegionPath {
  id: string;
  d: string;
}

function buildPaths(geo: GeoJSON.FeatureCollection, width: number, height: number): RegionPath[] {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  const polys: Array<{ id: string; coords: number[][][] }> = [];

  geo.features.forEach((f, idx) => {
    const props = f.properties as Record<string, unknown> | null;
    const id = String((f.id ?? (props?.id as string | undefined)) ?? `region-${idx}`);
    let coords: number[][][] = [];
    if (f.geometry.type === 'Polygon') {
      coords = f.geometry.coordinates as number[][][];
    } else if (f.geometry.type === 'MultiPolygon') {
      coords = (f.geometry.coordinates as number[][][][]).flat();
    }
    coords.forEach(poly =>
      poly.forEach(([x, y]) => {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }),
    );
    polys.push({ id, coords });
  });

  const scaleX = width / (maxX - minX);
  const scaleY = height / (maxY - minY);

  return polys.map(p => {
    const d = p.coords
      .map(poly =>
        poly
          .map(([x, y], i) => {
            const px = (x - minX) * scaleX;
            const py = height - (y - minY) * scaleY;
            return `${i === 0 ? 'M' : 'L'}${px} ${py}`;
          })
          .join(' ') + ' Z',
      )
      .join(' ');
    return { id: p.id, d };
  });
}

export function MapEditorView({ mapId }: MapEditorViewProps) {
  const map: MapRecord | undefined = useMapsStore(s => s.items.find(m => m.id === mapId));
  const updateMap = useMapsStore(s => s.update);

  const [selected, setSelected] = useState<string | null>(null);
  const [color, setColor] = useState('');
  const [label, setLabel] = useState('');
  const [tooltip, setTooltip] = useState('');

  const paths = map?.geoJson ? buildPaths(map.geoJson, 800, 600) : [];

  const handleSelect = (id: string) => {
    if (!map) return;
    setSelected(id);
    setColor(map.regionColors[id] || '');
    setLabel(map.regionLabels[id] || '');
    setTooltip(map.regionTooltips[id] || '');
  };

  const handleSave = () => {
    if (!map || !selected) return;
    const updated: Partial<MapRecord> & { id: string; updatedAt: string } = {
      id: map.id,
      updatedAt: new Date().toISOString(),
      regionColors: { ...map.regionColors, [selected]: color },
      regionLabels: { ...map.regionLabels, [selected]: label },
      regionTooltips: { ...map.regionTooltips, [selected]: tooltip },
    };
    updateMap(updated as MapRecord);
    setSelected(null);
  };

  if (!map) {
    return (
      <PageSection title="Map"><Typography>Map not found.</Typography></PageSection>
    );
  }

  return (
  <PageSection title={map.name} description="Click a region to edit its settings">
    {map.geoJson ? (
      <Stack>
        <svg viewBox="0 0 800 600" width="100%" style={{ maxWidth: 800 }}>
          {paths.map(p => (
            <path
              key={p.id}
              d={p.d}
              fill={map.regionColors[p.id] || 'transparent'}
              stroke="#000"
              onClick={() => handleSelect(p.id)}
            />
          ))}
        </svg>
      </Stack>
    ) : (
      <Stack alignItems="center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={map.fileUrl} alt={map.name} style={{ maxWidth: '100%' }} />
      </Stack>
    )}
    <Drawer anchor="right" open={Boolean(selected)} onClose={() => setSelected(null)}>
      <Stack width={320} p={2} gap={2}>
        <Typography variant="h6">Region {selected}</Typography>
        <ColorPicker name="color" label="Color" value={color} onChange={e => setColor(e.target.value)} />
        <TextField label="Label" value={label} onChange={e => setLabel(e.target.value)} fullWidth />
        <TextField label="Tooltip" value={tooltip} onChange={e => setTooltip(e.target.value)} fullWidth />
        <Button variant="contained" onClick={handleSave}>Save</Button>
      </Stack>
    </Drawer>
  </PageSection>
  );
}
