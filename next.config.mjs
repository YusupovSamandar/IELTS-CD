import { fileURLToPath } from 'url';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize for faster local startup
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  },

  // Reduce JavaScript bundle size
  swcMinify: true,

  // Enable compiler optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production'
  },

  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60
  },

  // Enable webpack caching for faster rebuilds
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [fileURLToPath(import.meta.url)]
        }
      };
    }
    return config;
  }
};

export default nextConfig;
