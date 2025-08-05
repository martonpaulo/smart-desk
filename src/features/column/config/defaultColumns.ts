import { customColors } from '@/legacy/styles/colors';

export const defaultColumns = {
  todo: {
    title: 'To Do',
    color: customColors.blue.value,
  },
  done: {
    title: 'Done',
    color: customColors.green.value,
  },
  draft: {
    title: 'Draft',
    color: customColors.red.value,
  },
  events: {
    title: 'Events',
    color: customColors.violet.value,
  },
  backlog: {
    title: 'Backlog',
    color: customColors.pink.value,
  },
};
