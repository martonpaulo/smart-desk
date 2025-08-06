import { use } from 'react';

import { MapEditorView } from '@/features/map/views/MapEditorView';

interface MapPageProps {
  params: Promise<{ mapId: string }>;
}

export default function MapPage({ params }: MapPageProps) {
  const { mapId } = use(params);

  return <MapEditorView mapId={mapId} />;
}
