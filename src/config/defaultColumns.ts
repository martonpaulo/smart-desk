import { colors } from '@/config/colors';

export const defaultColumns = {
  todo: {
    title: 'To Do',
    color: colors.blue.value,
  },
  done: {
    title: 'Done',
    color: colors.green.value,
  },
  draft: {
    title: 'Draft',
    color: colors.red.value,
  },
};
