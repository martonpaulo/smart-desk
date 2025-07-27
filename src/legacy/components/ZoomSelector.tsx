import { QuantitySelector } from '@/legacy/components/QuantitySelector';
import { useUiPrefsStore } from '@/legacy/store/uiPrefsStore';

export function ZoomSelector() {
  const zoom = useUiPrefsStore(state => state.zoom);
  const setZoom = useUiPrefsStore(state => state.setZoom);

  // receive percent value (e.g. 120) → store as decimal (1.2)
  const handleChange = (percentValue: number) => {
    setZoom(percentValue / 100);
  };

  return (
    <QuantitySelector
      value={Math.round(zoom * 100)}
      onValueChange={handleChange}
      minValue={10}
      maxValue={300}
      step={10}
      suffix="%"
      hasSpace={false}
    />
  );
}
