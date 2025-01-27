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
    serverActions: {
      bodySizeLimit: '50mb'
    },
    turbo: {
      rules: {
        // Configure external packages for edge runtime
        externals: ['openai']
      }
    }
  },
  typescript: {
    ignoreBuildErrors: true // Temporarily ignore TS errors during build
  }
};

export default nextConfig;