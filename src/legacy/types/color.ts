export enum Color {
  Red = 'red',
  Pink = 'pink',
  Purple = 'purple',
  Violet = 'violet',
  Indigo = 'indigo',
  Blue = 'blue',
  Cyan = 'cyan',
  Teal = 'teal',
  Green = 'green',
  Mint = 'mint',
  Lime = 'lime',
  Yellow = 'yellow',
  Amber = 'amber',
  Orange = 'orange',
  Tangerine = 'tangerine',
  Brown = 'brown',
  Grey = 'grey',
  Stone = 'stone',
  Black = 'black',
}

export type ColorOption = {
  label: string;
  value: string;
};

export type ColorMap = {
  [key in Color]: ColorOption;
};
