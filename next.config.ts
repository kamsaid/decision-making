/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
          { key: 'Content-Type', value: 'application/json' }
        ],
      },
    ]
  },
  experimental: {
    serverActions: true,
  },
};

export default nextConfig;