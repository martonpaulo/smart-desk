'use client';

import AddIcon from '@mui/icons-material/Add';
import { Button, Stack, Typography } from '@mui/material';
import { useState } from 'react';

import { PageSection } from 'src/core/components/PageSection';
import { LocationCard } from 'src/features/location/components/LocationCard';
import { LocationModal } from 'src/features/location/components/LocationModal';
import { useLocationsStore } from 'src/features/location/store/useLocationsStore';
import { Location } from 'src/features/location/types/Location';

export default function LocationsManagerPage() {
  const allLocations = useLocationsStore(s => s.items);
  const locations = allLocations
    .filter(location => !location.trashed)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const [editing, setEditing] = useState<Partial<Location>>({});
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = (location?: Location) => {
    setEditing(location ? { ...location } : {});
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  return (
    <PageSection
      title="Locations & Dates"
      description="Plan where you'll be, when, and how, from cities and stays to flights, for use in your calendar"
    >
      <Stack direction="row" mb={2}>
        <Button startIcon={<AddIcon />} variant="outlined" onClick={() => openModal()}>
          Add Location
        </Button>
      </Stack>

      {locations.length === 0 && <Typography>No locations created yet.</Typography>}

      <Stack direction="row" flexWrap="wrap" gap={2}>
        {locations.map(location => (
          <Stack key={location.id} direction="row" alignItems="center">
            <LocationCard location={location} onClickAction={() => openModal(location)} />
          </Stack>
        ))}
      </Stack>

      <LocationModal open={modalOpen} location={editing} onClose={closeModal} />
    </PageSection>
  );
}
