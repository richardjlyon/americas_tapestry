# Vercel Deployment Fix for America's Tapestry Website

## Summary of Changes

These changes fix the issues with broken image links in the Vercel production deployment by ensuring that the content directory is properly accessible and that images can be served directly from there.

## Key Changes

1. **Middleware for Content Access**
   - Added a `middleware.ts` file to handle content directory access
   - Sets appropriate cache headers for content files

2. **Next.js Configuration**
   - Updated `next.config.mjs` to allow content directory access
   - Added rewrites configuration to properly handle content paths
   - Included domain configuration for image optimization

3. **Vercel Configuration**
   - Updated `vercel.json` to include routes for content directory
   - Added cache headers for content files

4. **Build Process**
   - Created `prepare-content-for-vercel.mjs` script to ensure content is accessible
   - This script creates a symlink or copies content to public/content
   - Updated build commands to include this preparation step

5. **Path Handling**
   - Standardized image paths across components
   - Ensured all components use the Next.js Image component
   - Properly handled content paths for all media

## How It Works

1. During the build process, the `prepare-content-for-vercel.mjs` script runs and makes the content directory accessible by either:
   - Creating a symbolic link from `public/content` to `content` (preferred)
   - Copying the content directory to `public/content` (fallback)

2. The Next.js configuration includes:
   - Rewrites that map `/content/*` requests to the actual content directory
   - Image optimization settings that include the domain
   - Headers configuration to enable caching for content files

3. The middleware intercepts requests to `/content/*` and adds appropriate headers

4. Components use the Next.js Image component with paths properly formatted to point to the content directory

## Testing

To test these changes:

1. Run the development server: `pnpm dev`
2. Verify that images load correctly from the content directory
3. Build the project: `pnpm build`
4. Start the production server: `pnpm start`
5. Verify that images load correctly in production mode

## Troubleshooting

If images still don't load in production:

1. Check the Next.js build logs for any errors
2. Verify that the content directory is being properly included in the build
3. Check that the image paths in components are correctly formatted
4. Inspect the network requests in the browser to see the actual paths being requested

## Notes

- This approach keeps the original files in the content directory
- It avoids copying files to the public directory during build (except as a fallback)
- It leverages Next.js image optimization for better performance
- It maintains the separation of content from the public directory
- Audio and video files are still handled separately with the copy-video-files.mjs script