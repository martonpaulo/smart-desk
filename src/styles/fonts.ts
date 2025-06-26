import { Poppins } from 'next/font/google';

export const poppins = Poppins({
  variable: '--font-poppins',
  weight: ['300', '400', '500', '600'],
  subsets: ['latin'],
  display: 'swap',
});
