import {
  DoDisturbOutlined as PauseIcon,
  LocalFireDepartment as FireIcon,
  NotificationsActive as AlertIcon,
  Security as ShieldIcon,
} from '@mui/icons-material';
import { Stack, StackProps, SvgIconOwnProps, Tooltip } from '@mui/material';

import { useResponsiveness } from '@/hooks/useResponsiveness';
import { Task } from '@/types/task';

interface PriorityFlagProps extends Omit<StackProps, 'children'> {
  task: Task;
  showEisenhowerIcons?: boolean;
}

export function PriorityFlag({
  task,
  showEisenhowerIcons = true,
  sx,
  ...stackProps
}: PriorityFlagProps) {
  const { isMobile } = useResponsiveness();
  const shouldDisplay = task.blocked || (showEisenhowerIcons && (task.important || task.urgent));

  if (!shouldDisplay) return null;

  let Icon = PauseIcon;
  let color: SvgIconOwnProps['color'] = 'action';
  let tooltipLabel = 'Blocked';
  let paddingTop = isMobile ? 0 : 0.25;
  let fontSize = isMobile ? 20 : 16;

  if (!task.blocked) {
    if (task.important && task.urgent) {
      Icon = FireIcon;
      tooltipLabel = 'Important & urgent';
      color = 'error';
      paddingTop = isMobile ? 0 : 0.1;
      fontSize = isMobile ? 22 : 18;
    } else if (task.important) {
      Icon = ShieldIcon;
      tooltipLabel = 'Important';
      color = 'action';
      paddingTop = isMobile ? 0 : 0.35;
      fontSize = isMobile ? 18 : 14;
    } else if (task.urgent) {
      Icon = AlertIcon;
      tooltipLabel = 'Urgent';
      color = 'warning';
      paddingTop = isMobile ? 0 : 0.3;
      fontSize = isMobile ? 17 : 15;
    }
  }

  return (
    <Stack
      direction="row"
      sx={{
        alignSelf: 'flex-start',
        alignContent: 'center',
        justifyContent: 'center',
        paddingTop,
        fontSize,
        width: 18,
        ...sx,
      }}
      {...stackProps}
    >
      <Tooltip title={tooltipLabel}>
        <Icon color={color} fontSize="inherit" />
      </Tooltip>
    </Stack>
  );
}
