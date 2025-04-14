import type { NextConfig } from 'next'
import withNextIntl from 'next-intl/plugin'

const nextConfig: NextConfig = withNextIntl()({
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        port: '',
      },
    ],
  },
  poweredByHeader: false,
  reactStrictMode: true,
  // Configure production output tracing for better error diagnostics
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
})

export default nextConfig
