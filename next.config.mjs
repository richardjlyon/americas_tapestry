/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hebbkx1anhila5yf.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Exclude content files from serverless function bundles
  outputFileTracingExcludes: {
    '*': [
      'content/**/*',
      'public/content/**/*',
      'public/images/**/*',
      'public/video/**/*',
      'scripts/**/*',
      '**/*.md',
      '**/*.mdx',
      'node_modules/@swc/core-linux-x64-gnu/**/*',
      'node_modules/@swc/core-linux-x64-musl/**/*',
      'node_modules/@next/swc-linux-x64-gnu/**/*',
      'node_modules/@next/swc-linux-x64-musl/**/*',
    ],
  },
  // Essential rewrites for content directory
  async rewrites() {
    return [
      {
        source: '/content/:path*',
        destination: '/content/:path*',
      },
    ]
  },
  // Basic headers for content delivery
  async headers() {
    return [
      {
        source: '/content/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },
    ]
  },
}

export default nextConfig