import { JetBrains_Mono, Poppins } from 'next/font/google';

export const poppins = Poppins({
  variable: '--font-poppins',
  weight: ['300', '400', '500', '600'],
  subsets: ['latin'],
  display: 'swap',
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  display: 'swap',
  variable: '--font-code',
});
