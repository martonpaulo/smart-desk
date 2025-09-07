import { Chip, ChipProps } from '@mui/material';
import { Event } from 'src/legacy/types/Event';
import { computeEventStatus, getUpcomingEventLabel } from 'src/legacy/utils/eventUtils';

interface MinutesChipProps extends ChipProps {
  event: Event;
}

export function MinutesChip({ event, ...props }: MinutesChipProps) {
  const isCurrent = computeEventStatus(event) === 'current';
  const chipColor = isCurrent ? 'warning' : 'default';
  const chipLabel = getUpcomingEventLabel(event);

  const handleClick = () => {};

  return (
    <Chip label={chipLabel} color={chipColor} onClick={handleClick} clickable={false} {...props} />
  );
}
