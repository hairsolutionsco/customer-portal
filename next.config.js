/** @type {import('next').NextConfig} */
const typescriptConfigPath = process.env.NEXT_TYPESCRIPT_TSCONFIG || 'tsconfig.json'

const nextConfig = {
  output: 'standalone',
  typescript: {
    tsconfigPath: typescriptConfigPath,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
      {
        protocol: 'https',
        hostname: '**.shopify.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-DNS-Prefetch-Control', value: 'on' },
      ],
    },
  ],
  poweredByHeader: false,
}

module.exports = nextConfig
