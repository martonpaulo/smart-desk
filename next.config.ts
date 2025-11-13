import type { NextConfig } from 'next';
import type { Configuration } from 'webpack';

const isProd = process.env.NODE_ENV === 'production';
const isVercelProd = process.env.VERCEL_ENV === 'production';
const enableReactCompiler =
  isProd && isVercelProd && process.env.NEXT_DISABLE_REACT_COMPILER !== '1';

const COMMIT_SHA = (process.env.VERCEL_GIT_COMMIT_SHA ?? '').slice(0, 7);
const APP_VERSION = COMMIT_SHA || 'dev';
const BUILD_DATE = new Date().toISOString();

const nextConfig: NextConfig & { reactCompiler?: boolean; turbopack?: Record<string, unknown> } = {
  reactCompiler: enableReactCompiler,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  experimental: {
    optimizePackageImports: [
      '@mui/material',
      '@mui/system',
      '@mui/icons-material',
      '@mui/x-date-pickers',
      'date-fns',
    ],
    memoryBasedWorkersCount: true,
  } as Record<string, unknown>,

  // Apply dev-only webpack optimizations when running in development
  webpack(config: Configuration, { dev }: { dev: boolean }) {
    if (dev) {
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };

      config.cache = { type: 'memory', maxGenerations: 1 } as Configuration['cache'];
      config.devtool = 'eval-cheap-module-source-map';
    }
    return config;
  },

  // Keep an explicit turbopack entry to avoid Next.js errors when using a custom webpack config
  turbopack: {},

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },

  env: {
    NEXT_PUBLIC_APP_VERSION: APP_VERSION,
    NEXT_PUBLIC_APP_BUILD_DATE: BUILD_DATE,
  },
};

export default nextConfig;
