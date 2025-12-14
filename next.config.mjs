/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    formats: ['image/webp', 'image/avif'],
    // Optimized device sizes - reduced from 8 to 6 breakpoints to decrease optimization count
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    // Optimized image sizes - removed 384 to reduce variants
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    // Cache optimized images for 1 year
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    localPatterns: [
      {
        pathname: '/images/**',
      },
      {
        pathname: '/support/**',
      },
      {
        pathname: '/video/**',
      },
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hebbkx1anhila5yf.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Exclude unnecessary files from serverless function bundles (but keep content!)
  outputFileTracingExcludes: {
    '*': [
      'public/images/**/*',
      'public/video/**/*',
      'scripts/**/*',
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