import type { NextConfig } from 'next';
import type { Configuration } from 'webpack';

const isProd = process.env.NODE_ENV === 'production';
const isVercelProd = process.env.VERCEL_ENV === 'production';
const enableReactCompiler =
  isProd && isVercelProd && process.env.NEXT_DISABLE_REACT_COMPILER !== '1'; // manual kill-switch

const COMMIT_SHA = (process.env.VERCEL_GIT_COMMIT_SHA ?? '').slice(0, 7);
const APP_VERSION = COMMIT_SHA || 'dev';
const BUILD_DATE = new Date().toISOString();

const nextConfig: NextConfig = {
  // Smaller runtime image for Docker and serverless
  // output: 'standalone', // Disabled for Vercel deployment

  transpilePackages: [
    '@smart-desk/data-access',
    '@smart-desk/design-system',
    '@smart-desk/hooks',
    '@smart-desk/icons',
    '@smart-desk/store',
    '@smart-desk/types',
    '@smart-desk/ui-web',
    '@smart-desk/utils',
  ],

  experimental: {
    optimizePackageImports: [
      '@mui/material',
      '@mui/system',
      '@mui/icons-material',
      '@mui/x-date-pickers',
      'date-fns',
    ],
    // Only use React Compiler in production
    reactCompiler: enableReactCompiler,
    // Reduce memory usage in development
    memoryBasedWorkersCount: true,
  },

  // Turbopack configuration (moved from experimental.turbo)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Security + size
  poweredByHeader: false,
  productionBrowserSourceMaps: false,

  // Development optimizations
  ...(process.env.NODE_ENV === 'development' && {
    // Reduce bundle analysis overhead
    webpack: (config: Configuration, { dev }: { dev: boolean }) => {
      if (dev) {
        // Optimize for development speed
        config.optimization = {
          ...config.optimization,
          removeAvailableModules: false,
          removeEmptyChunks: false,
          splitChunks: false,
        };

        // Reduce memory usage
        config.cache = {
          type: 'memory',
          maxGenerations: 1,
        };

        // Faster source maps in development
        config.devtool = 'eval-cheap-module-source-map';
      }
      return config;
    },
  }),

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
