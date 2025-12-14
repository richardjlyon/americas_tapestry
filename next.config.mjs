/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    // Use custom loader for R2-hosted images (eliminates Vercel image optimization costs)
    loader: 'custom',
    loaderFile: './src/lib/cloudflare-loader.ts',
    // Still allow these formats for any images not using custom loader
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Remote patterns for R2 and other external sources
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-93847b5093894cc7874bdee71704b7b5.r2.dev',
        port: '',
        pathname: '/**',
      },
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