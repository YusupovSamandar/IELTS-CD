/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize for faster local startup
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  },
  
  // Reduce JavaScript bundle size
  swcMinify: true
};

export default nextConfig;
