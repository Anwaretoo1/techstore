/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Required for Docker
  images: {
    domains: ['localhost', 'via.placeholder.com'],
    remotePatterns: [{ protocol: 'http', hostname: 'localhost', port: '5000', pathname: '/uploads/**' }],
    formats: ['image/avif', 'image/webp'],
  },
  swcMinify: true,
};

module.exports = nextConfig;
