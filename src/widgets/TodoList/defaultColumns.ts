import { colorMap } from '@/styles/colors';
import { ColorOption } from '@/types/color';

export enum DefaultColumn {
  DRAFT = 'draft',
  DONE = 'done',
}

type DefaultColumnMap = Record<DefaultColumn, { title: string; colorOption: ColorOption }>;

export const defaultColumnMap: DefaultColumnMap = {
  [DefaultColumn.DRAFT]: { title: 'Draft', colorOption: colorMap['grey'] },
  [DefaultColumn.DONE]: { title: 'Done', colorOption: colorMap['green'] },
};
