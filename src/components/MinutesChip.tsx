import { Chip, ChipProps } from '@mui/material';

import { IEvent } from '@/types/IEvent';
import { computeEventStatus, getUpcomingEventLabel } from '@/utils/eventUtils';

interface MinutesChipProps extends ChipProps {
  event: IEvent;
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
