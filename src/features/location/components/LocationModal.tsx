import { useEffect, useState } from 'react';

import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { addDays, isEqual as isEqualDate } from 'date-fns';

import { useLocationsStore } from '@/features/location/store/useLocationsStore';
import { Location, LocationType } from '@/features/location/types/Location';
import { CustomDialog } from '@/shared/components/CustomDialog';
import { DateInput } from '@/shared/components/DateInput';

interface LocationModalProps {
  open: boolean;
  onClose: () => void;
  location: Partial<Location>;
}

const LOCATION_TYPE_OPTIONS: Array<{ value: LocationType; label: string }> = [
  { value: 'city', label: 'City' },
  { value: 'flight', label: 'Flight' },
  { value: 'bus', label: 'Bus' },
  { value: 'stay', label: 'Stay' },
  { value: 'hidden', label: 'Hidden' },
];

function buildInitialValues(location?: Partial<Location>) {
  const now = new Date();
  return {
    name: location?.name?.trim() ?? '',
    type: (location?.type ?? 'city') as LocationType,
    start: location?.startDate ?? now,
    end: location?.endDate ?? addDays(now, 1),
    createdAt: location?.createdAt ?? now,
    id: location?.id,
  };
}

export function LocationModal({ open, onClose, location }: LocationModalProps) {
  const initial = buildInitialValues(location);

  const [name, setName] = useState(initial.name);
  const [type, setType] = useState<LocationType>(initial.type);
  const [start, setStart] = useState<Date>(initial.start);
  const [end, setEnd] = useState<Date>(initial.end);

  const addLocation = useLocationsStore(s => s.add);
  const updateLocation = useLocationsStore(s => s.update);
  const softDeleteLocation = useLocationsStore(s => s.softDelete);

  useEffect(() => {
    if (!open) return;
    const freshInitial = buildInitialValues(location);
    setName(freshInitial.name);
    setType(freshInitial.type);
    setStart(freshInitial.start);
    setEnd(freshInitial.end);
  }, [open, location]);

  const handleStartChange = (value: Date | null) => {
    if (!value) return;
    setStart(value);
    setEnd(prev => (prev && prev >= value ? prev : addDays(value, 1)));
  };

  const handleEndChange = (value: Date | null) => {
    if (!value) return;
    setEnd(value >= start ? value : addDays(start, 1));
  };

  const handleTypeChange = (e: SelectChangeEvent<LocationType>) => {
    setType(e.target.value as LocationType);
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    const now = new Date();

    const payload: Partial<Location> = {
      name: trimmedName,
      type,
      startDate: start,
      endDate: end,
      updatedAt: now,
    };

    if (initial.id) {
      updateLocation({ ...payload, id: initial.id });
    } else {
      addLocation({ ...payload, createdAt: now });
    }

    return Promise.resolve();
  };

  const isDirty =
    name.trim() !== initial.name ||
    type !== initial.type ||
    !isEqualDate(start, initial.start) ||
    !isEqualDate(end, initial.end);

  const isValid = name.trim().length > 0;

  return (
    <CustomDialog
      item="location"
      open={open}
      mode={initial.id ? 'edit' : 'new'}
      isDirty={isDirty}
      isValid={isValid}
      onClose={onClose}
      onSave={handleSave}
      deleteAction={initial.id ? softDeleteLocation : undefined}
      deleteId={initial.id}
      title={name}
      onTitleChange={setName}
      titlePlaceholder="Where are you going to be?"
      titleLimit={16}
      maxWidth="mobileSm"
    >
      <FormControl fullWidth size="small" margin="dense" variant="outlined">
        <InputLabel id="location-type-label" required>
          Type
        </InputLabel>
        <Select<LocationType>
          labelId="location-type-label"
          id="location-type"
          label="Type"
          value={type}
          onChange={handleTypeChange}
          required
        >
          {LOCATION_TYPE_OPTIONS.map(opt => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <DateInput label="Start Date" value={start} onChange={handleStartChange} />
      <DateInput label="End Date" value={end} onChange={handleEndChange} />
    </CustomDialog>
  );
}
