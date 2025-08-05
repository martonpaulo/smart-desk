import type { NextConfig } from 'next';

// eslint-disable-next-line no-restricted-imports
import packageJson from './package.json';

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.VERCEL_GIT_COMMIT_SHA || packageJson.version,
    NEXT_PUBLIC_APP_BUILD_DATE: new Date().toISOString(),
  },
};

export default nextConfig;
