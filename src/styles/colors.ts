import {
  amber,
  blue,
  blueGrey,
  brown,
  common,
  cyan,
  deepOrange,
  deepPurple,
  green,
  grey,
  indigo,
  lightGreen,
  lime,
  orange,
  pink,
  purple,
  red,
  teal,
  yellow,
} from '@mui/material/colors';

import { ColorMap } from '@/types/color';

export const colorMap: ColorMap = {
  blue: { label: 'Blue', value: blue[500] },
  green: { label: 'Green', value: green[500] },
  red: { label: 'Red', value: red[500] },
  yellow: { label: 'Yellow', value: yellow[500] },
  amber: { label: 'Amber', value: amber[500] },

  teal: { label: 'Teal', value: teal[500] },
  cyan: { label: 'Cyan', value: cyan[500] },
  indigo: { label: 'Indigo', value: indigo[500] },
  violet: { label: 'Violet', value: deepPurple[500] },
  purple: { label: 'Purple', value: purple[500] },

  pink: { label: 'Pink', value: pink[500] },
  mint: { label: 'Mint', value: lightGreen[500] },
  lime: { label: 'Lime', value: lime[500] },
  orange: { label: 'Orange', value: orange[500] },
  tangerine: { label: 'Tangerine', value: deepOrange[500] },

  grey: { label: 'Grey', value: grey[500] },
  stone: { label: 'Stone', value: blueGrey[500] },
  black: { label: 'Black', value: common.black },
  brown: { label: 'Brown', value: brown[500] },
};
