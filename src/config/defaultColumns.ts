import { customColors } from '@/styles/colors';

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
};
