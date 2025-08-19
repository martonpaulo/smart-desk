import { LinearProgress, Stack, StackProps, Typography } from '@mui/material';

import { useTasks } from '@/legacy/hooks/useTasks';
import { resolveProgressState } from '@/shared/utils/progressUtils';

export function ProgressBarIndicator(props: StackProps) {
  const tasks = useTasks({
    plannedDate: new Date(),
    trashed: false,
    classified: true,
  });

  const totalCount = tasks.length;

  const completedCount = tasks.reduce((acc, task) => {
    const target = task.quantityTarget || 1;
    return acc + task.quantityDone / target;
  }, 0);

  // Clamp percentage between 0 and 100
  const rawPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  const percentage = Math.max(0, Math.min(100, rawPercent));

  const { color, label, fontWeight } = resolveProgressState(percentage);

  return (
    <Stack spacing={1} {...props}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2} height={16}>
        <Typography variant="body2" color={color} fontWeight={fontWeight} lineHeight={1}>
          {label}
        </Typography>

        <Typography variant="h4" color={color} lineHeight={1}>
          {parseFloat(completedCount.toFixed(2))} of {totalCount} ({percentage}%)
        </Typography>
      </Stack>

      <Stack height={16} justifyContent="center">
        <LinearProgress
          variant="determinate"
          value={percentage}
          sx={{
            height: 12,
            borderRadius: 2,
            bgcolor: 'rgba(0,0,0,0.05)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: color,
              transition: 'transform 0.4s ease, background-color 0.4s ease',
            },
          }}
        />
      </Stack>
    </Stack>
  );
}
