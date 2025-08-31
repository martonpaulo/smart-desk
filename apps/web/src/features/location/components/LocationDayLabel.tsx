'use client';

import { ReactElement } from 'react';

import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Avatar, AvatarGroup, Chip, Tooltip, useTheme } from '@mui/material';

import { Location, LocationType } from '@/features/location/types/Location';

type LocationDayLabelProps = {
  locations: Location[];
};

/**
 * Icon and color metadata for each LocationType.
 * Uses only theme palette. No hardcoded colors.
 */
const TYPE_META: Record<
  LocationType,
  {
    icon: ReactElement;
    color: 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'default';
  }
> = {
  city: { icon: <LocationCityIcon fontSize="small" />, color: 'info' },
  flight: { icon: <FlightTakeoffIcon fontSize="small" />, color: 'secondary' },
  bus: { icon: <DirectionsBusIcon fontSize="small" />, color: 'warning' },
  stay: { icon: <HomeWorkIcon fontSize="small" />, color: 'success' },
  hidden: { icon: <VisibilityOffIcon fontSize="small" />, color: 'default' },
};

/**
 * Compact label for a day cell top right.
 * 0 locations: returns null
 * 1 location: Chip with icon and name
 * many locations: AvatarGroup with tooltips to avoid clutter
 */
export function LocationDayLabel({ locations }: LocationDayLabelProps) {
  const theme = useTheme();

  if (!locations || locations.length === 0) return null;

  if (locations.length === 1) {
    const loc = locations[0];
    const meta = TYPE_META[loc.type];
    return (
      <Chip
        size="small"
        icon={meta.icon}
        label={loc.name}
        color={meta.color}
        sx={{
          height: 20,
          fontSize: '0.65rem',
          fontWeight: 600,
          '& .MuiChip-icon': { fontSize: '0.9rem' },
          '& .MuiChip-label': { px: 0.75 },
        }}
        aria-label={`Location ${loc.name}`}
      />
    );
  }

  // Many locations
  return (
    <AvatarGroup
      max={3}
      sx={{
        '& .MuiAvatar-root': { width: 18, height: 18, fontSize: 12 },
        '& .MuiAvatarGroup-avatar': { borderColor: theme.palette.background.paper },
      }}
    >
      {locations.map(loc => {
        const meta = TYPE_META[loc.type];
        return (
          <Tooltip key={loc.id} title={loc.name} arrow>
            <Avatar
              sx={{
                bgcolor:
                  meta.color === 'default'
                    ? theme.palette.action.disabledBackground
                    : theme.palette[meta.color].main,
                color:
                  meta.color === 'default'
                    ? theme.palette.text.secondary
                    : theme.palette[meta.color].contrastText,
              }}
              aria-label={`Location ${loc.name}`}
            >
              {meta.icon}
            </Avatar>
          </Tooltip>
        );
      })}
    </AvatarGroup>
  );
}
