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
  },
  // Output to standalone mode for Vercel
  output: 'standalone',
  // Exclude large content directories from serverless function bundle
  // This is crucial for keeping function size small
  experimental: {
    outputFileTracingExcludes: {
      '*': [
        './content/**/*',
        './public/images/**/*',
        './public/video/**/*',
        'node_modules/**/*.{jpg,jpeg,png,gif,webp,mp4,mp3,svg}'
      ],
    },
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
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