import type { NextConfig } from 'next';

// PowerSync uses SharedArrayBuffer for its SQLite WASM worker.
// SharedArrayBuffer requires cross-origin isolation: both COOP and COEP headers must be set.
// Without these the browser silently disables SharedArrayBuffer and db.connect() hangs forever.
const CROSS_ORIGIN_HEADERS = [
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    disableStaticImages: true,
  },
  turbopack: {},
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: CROSS_ORIGIN_HEADERS,
      },
    ];
  },
};

export default nextConfig;
