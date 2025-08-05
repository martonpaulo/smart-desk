import { useEffect, useState } from 'react';

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';

import { customColors } from '@/legacy/styles/colors';

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  // currently selected color (from props)
  const [selectedColor, setSelectedColor] = useState<string>(value);
  // temporary color inside modal
  const [tempColor, setTempColor] = useState<string>(value);
  // modal open state
  const [isModalOpen, setModalOpen] = useState(false);

  // sync state when parent value changes
  useEffect(() => {
    setSelectedColor(value);
    setTempColor(value);
  }, [value]);

  // list of [key, { label, value }]
  const entries = Object.entries(customColors) as [string, { label: string; value: string }][];

  // find display info
  const selectedEntry = entries.find(([, c]) => c.value === selectedColor);
  const tempEntry = entries.find(([, c]) => c.value === tempColor);

  // open modal
  const openModal = () => {
    setTempColor(selectedColor);
    setModalOpen(true);
  };

  // close without applying
  const closeModal = () => {
    setModalOpen(false);
  };

  // apply selection and notify parent
  const applySelection = () => {
    setSelectedColor(tempColor);
    onChange(tempColor);
    setModalOpen(false);
  };

  return (
    <>
      {/* Button showing current color */}
      <Button
        variant="outlined"
        onClick={openModal}
        sx={{
          textTransform: 'none',
          justifyContent: 'flex-start',
          px: 1,
          py: 0.5,
        }}
      >
        {selectedEntry && (
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box
              sx={{
                width: 24,
                height: 24,
                bgcolor: selectedEntry[1].value,
                border: '1px solid',
                borderColor: 'grey.400',
                borderRadius: 0.5,
              }}
            />
            <Stack>
              <Typography variant="body2">{selectedEntry[1].label}</Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedEntry[1].value}
              </Typography>
            </Stack>
          </Stack>
        )}
      </Button>

      {/* Modal dialog with grid */}
      <Dialog open={isModalOpen} onClose={closeModal} maxWidth="mobileSm" fullWidth>
        <DialogTitle>Pick color</DialogTitle>
        <DialogContent>
          {/* grid of swatches */}
          <Stack display="grid" gridTemplateColumns="repeat(5, 1fr)" gap={1}>
            {entries.map(([key, { value: colorValue }]) => {
              const isActive = colorValue === tempColor;
              return (
                <Box
                  key={key}
                  role="button"
                  tabIndex={0}
                  onClick={() => setTempColor(colorValue)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setTempColor(colorValue);
                    }
                  }}
                  sx={{
                    width: '100%',
                    height: 40,
                    bgcolor: colorValue,
                    borderRadius: 1,
                    border: isActive ? '3px solid' : '1px solid',
                    borderColor: isActive ? 'primary.main' : 'grey.400',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.1)',
                    },
                  }}
                />
              );
            })}
          </Stack>

          {/* preview of temporary selection */}
          {tempEntry && (
            <Stack direction="row" alignItems="center" spacing={1} mt={2}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  bgcolor: tempEntry[1].value,
                  border: '1px solid',
                  borderColor: 'grey.400',
                  borderRadius: 0.5,
                }}
              />
              <Typography>{tempEntry[1].label}</Typography>
              <Typography color="text.secondary">{tempEntry[1].value}</Typography>
            </Stack>
          )}
        </DialogContent>

        {/* action buttons */}
        <DialogActions>
          <Button onClick={closeModal}>Cancel</Button>
          <Button variant="contained" onClick={applySelection}>
            Select
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
