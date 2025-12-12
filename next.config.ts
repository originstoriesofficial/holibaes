import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Tell Next 16 we intentionally use Turbopack (fixes build error)
  turbopack: {},

  images: {
    // Replace deprecated `domains` with `remotePatterns`
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'v3.fal.media',
      },
      {
        protocol: 'https',
        hostname: 'fal.media',
      },
      {
        protocol: 'https',
        hostname: 'fal-cdn.batuhan-941.workers.dev',
      },
      {
        protocol: 'https',
        hostname: 'replicate.delivery',
      },
      {
        protocol: 'https',
        hostname: 'aceternity.com',
      },
      {
        protocol: 'https',
        hostname: 'oaidalleapiprodscus.blob.core.windows.net',
      },
      {
        protocol: 'https',
        hostname: 'obj-store.livepeer.cloud',
      },
      {
        protocol: 'https',
        hostname: 'vod-cdn.lp-playback.studio',
      },
      {
        protocol: 'https',
        hostname: 'your-bucket.s3.us-west-2.amazonaws.com', // replace with actual bucket hostname if needed
      },
    ],
  },

  webpack: (config) => {
    // Keep existing externals for AppKit / WalletConnect setup
    config.externals = config.externals || [];
    if (Array.isArray(config.externals)) {
      config.externals.push('pino-pretty', 'lokijs', 'encoding');
    }
    return config;
  },
};

export default nextConfig;
