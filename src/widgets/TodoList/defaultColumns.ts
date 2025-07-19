import { colorMap } from '@/styles/colors';

export const defaultColumns = {
  todo: {
    title: 'To Do',
    color: colorMap.blue.value,
  },
  done: {
    title: 'Done',
    color: colorMap.green.value,
  },
  draft: {
    title: 'Draft',
    color: colorMap.red.value,
  },
};
