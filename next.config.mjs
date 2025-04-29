let userConfig = undefined
try {
  userConfig = await import('./v0-user-next.config')
} catch (e) {
  // ignore error
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Enable Next.js image optimization
    formats: ['image/avif', 'image/webp'],
    // Add remote patterns if needed for external images
    remotePatterns: [],
    // Optional: set size limits if needed
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Allow files from content directory to be served through next/image
    domains: ['localhost', 'www.americastapestry.com'],
  },
  // Output to standalone mode for Vercel
  output: 'standalone',
  // Exclude large content directories from serverless function bundle
  // This is crucial for keeping function size small
  outputFileTracingExcludes: {
    '*': [
      './content/**/*',
      './public/content/**/*',
      './public/video/**/*',
      'node_modules/**/*.{jpg,jpeg,png,gif,webp,mp4,mp3,svg}'
    ],
  },
  // Add the content directory to the list of public directories
  // This ensures that the content directory is copied to the output directory
  transpilePackages: [],
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  // Make content directory accessible
  async rewrites() {
    return [
      {
        source: '/content/:path*',
        destination: '/content/:path*',
      },
    ]
  },
  // Configure static asset handling more directly
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },
      {
        // Enable content directory access
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

mergeConfig(nextConfig, userConfig)

function mergeConfig(nextConfig, userConfig) {
  if (!userConfig) {
    return
  }

  for (const key in userConfig) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...userConfig[key],
      }
    } else {
      nextConfig[key] = userConfig[key]
    }
  }
}

export default nextConfig