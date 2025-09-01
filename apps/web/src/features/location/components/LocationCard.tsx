'use client';

import { ReactNode, useMemo } from 'react';

import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
  Avatar,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import { differenceInCalendarDays, format } from 'date-fns';
import { Location, LocationType } from 'src/features/location/types/Location';

interface LocationCardProps {
  location: Location;
  onClickAction: () => void;
}

type TypeMeta = {
  label: string;
  icon: ReactNode;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'default';
  chipVariant?: 'filled' | 'outlined';
  muted?: boolean;
};

const TYPE_META: Record<LocationType, TypeMeta> = {
  city: {
    label: 'City',
    icon: <LocationCityIcon fontSize="small" />,
    color: 'info',
  },
  flight: {
    label: 'Flight',
    icon: <FlightTakeoffIcon fontSize="small" />,
    color: 'secondary',
  },
  bus: {
    label: 'Bus',
    icon: <DirectionsBusIcon fontSize="small" />,
    color: 'warning',
  },
  stay: {
    label: 'Stay',
    icon: <HomeWorkIcon fontSize="small" />,
    color: 'success',
  },
  hidden: {
    label: 'Hidden',
    icon: <VisibilityOffIcon fontSize="small" />,
    color: 'default',
    chipVariant: 'outlined',
    muted: true,
  },
};

function formatRange(start: Date, end: Date) {
  // Simple, locale friendly range
  const sameMonth =
    start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  if (sameMonth) {
    return `${format(start, 'MMM d')} to ${format(end, 'd, yyyy')}`;
  }
  return `${format(start, 'MMM d, yyyy')} to ${format(end, 'MMM d, yyyy')}`;
}

export function LocationCard({ location, onClickAction }: LocationCardProps) {
  const meta = useMemo(() => TYPE_META[location.type], [location.type]);

  const days = useMemo(() => {
    const diff = differenceInCalendarDays(new Date(location.endDate), new Date(location.startDate));
    return Math.max(diff, 0) + 1;
  }, [location.startDate, location.endDate]);

  const range = useMemo(
    () => formatRange(new Date(location.startDate), new Date(location.endDate)),
    [location.startDate, location.endDate],
  );

  return (
    <Card
      variant="outlined"
      sx={theme => ({
        position: 'relative',
        overflow: 'hidden',
        opacity: meta.muted ? 0.7 : 1,
        transition: theme.transitions.create(['transform', 'box-shadow']),
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[6],
        },
      })}
    >
      {/* Left accent bar based on type color */}
      <Box
        sx={theme => ({
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 6,
          bgcolor:
            meta.color === 'default' ? theme.palette.divider : theme.palette[meta.color].main,
        })}
      />

      <CardActionArea
        onClick={onClickAction}
        sx={{ pl: 1 }} // space to visually balance the accent bar
        aria-label={`Open ${location.name} ${meta.label.toLowerCase()}`}
      >
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={2} alignItems="center" flex={1} minWidth={0}>
              <Avatar
                sx={theme => ({
                  bgcolor:
                    meta.color === 'default'
                      ? theme.palette.action.disabledBackground
                      : theme.palette[meta.color].light,
                  color:
                    meta.color === 'default'
                      ? theme.palette.text.secondary
                      : theme.palette[meta.color].dark,
                  width: 40,
                  height: 40,
                })}
                variant="rounded"
              >
                {meta.icon}
              </Avatar>

              <Stack spacing={0.25} minWidth={0}>
                <Typography
                  variant="subtitle1"
                  noWrap
                  sx={{ fontWeight: 600 }}
                  title={location.name}
                >
                  {location.name}
                </Typography>

                <Typography variant="body2" color="text.secondary" noWrap title={range}>
                  {range} • {days} {days > 1 ? 'days' : 'day'}
                </Typography>
              </Stack>
            </Stack>

            <Chip
              size="small"
              variant={meta.chipVariant ?? 'filled'}
              color={meta.color === 'default' ? 'default' : meta.color}
              label={meta.label}
              sx={{ fontWeight: 600 }}
            />
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
