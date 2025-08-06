import { MapEditorView } from '@/features/map/views/MapEditorView';

interface MapPageProps {
  params: { mapId: string };
}

export default function MapPage({ params }: MapPageProps) {
  return <MapEditorView mapId={params.mapId} />;
}
