# America's Tapestry Deployment Guide

## Image and Content Handling

This project uses a content directory-based approach for managing images and other assets. During development and deployment, the system works as follows:

### Directory Structure
- `/content` - Original source content (images, markdown, etc.)
- `/public/content` - Symlink or copy of content for public access
- `/public/video` - Video files that are copied from content/video

### Image Path Reference
All components and libraries should reference images using:
- `/content/[type]/[item]/[filename]` - Standard content path

### Build Process
1. During build, `prepare-content-for-vercel.mjs` makes content available:
   - In development: Creates a symlink from /content to /public/content
   - In Vercel: Copies content files to /public/content
   
2. `copy-video-files.mjs` copies only video files to /public/video

3. Next.js Image optimization is enabled, handling image resizing and optimization

### Middleware
A middleware (`middleware.ts`) manages requests to /content paths, adding proper caching headers.

### Libraries
The following utilities help standardize path handling:
- `getImagePath()` - Converts any path to a proper content path
- `convertImagePath()` - Special handling for old path formats in markdown

## Vercel Configuration

For Vercel deployment, the following settings are important:

1. Set `output: 'standalone'` to optimize serverless function sizes
2. Configure `outputFileTracingExcludes` to exclude content from function bundles
3. Enable rewrites and headers in next.config.mjs to properly serve content

## Troubleshooting

If images fail to load:
1. Check that paths are using `/content/...` format
2. Verify that prepare-content-for-vercel.mjs ran successfully
3. Check Vercel logs for any errors during content preparation
4. For local development, make sure the symlink was created correctly