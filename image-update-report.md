# Image Path Strategy Update Report

## Components Using HTML img Tags

These components need to be updated to use the Next.js Image component and the new image path strategy:

1. **featured-post.tsx**
   - Uses `<img>` tag on line 22
   - Should use Next.js Image component with getImagePath utility

2. **tapestries/tapestry-card.tsx**
   - Uses `<img>` tag on line 41
   - Should use Next.js Image component with getImagePath utility for tapestry thumbnails

3. **sponsor-card.tsx**
   - Uses `<img>` tag on line 78
   - Should use Next.js Image component with getImagePath utility for sponsor logos

4. **team/person-card.tsx**
   - Uses `<img>` tag
   - Needs to be checked for compatibility with the image path strategy

5. **full-image-viewer.tsx**
   - Uses `<img>` tag
   - Should be updated for improved image handling

6. **support/support-merchandise.tsx**
   - Uses `<img>` tag
   - Should be updated to Next.js Image component

## Components Already Using Next.js Image

These components are already using the Next.js Image component but should be verified for proper image path handling:

1. **header.tsx**
   - Uses Next.js Image component correctly
   - Should verify that paths match the expected strategy

2. **team-member-card.tsx**
   - Already uses Next.js Image component
   - Already uses getImagePath from image-utils.ts
   - Good example of proper implementation

## Image Path Strategy

The codebase has an `image-utils.ts` file that provides utility functions for handling image paths:

- `getImagePath(path)`: Converts content paths to properly formatted image source paths
- `getVideoPath(path)`: Converts video paths to properly formatted source paths
- `getImageSizes(role)`: Generates responsive image sizes string based on the image's role

The strategy appears to handle relative paths from the content directory, converting them to absolute paths that work with Next.js Image optimization.

## Recommended Updates

1. Replace all `<img>` tags with Next.js `<Image>` components
2. Use the `getImagePath` utility for all image src attributes
3. Use the `getImageSizes` utility to define responsive behavior
4. Add proper error handling for image loading failures
5. Ensure placeholder images are provided

## Implementation Example

Based on team-member-card.tsx implementation, here's how other components should be updated:

```tsx
import Image from 'next/image';
import { getImagePath, getImageSizes } from '@/lib/image-utils';

// In the component:
const imagePath = getImagePath(item.imagePath);
const placeholderPath = '/placeholder.svg';

<Image
  src={imagePath || placeholderPath}
  alt={item.alt}
  fill
  sizes={getImageSizes('thumbnail')}
  className="object-cover"
  onError={handleImageError}
/>
```

This approach ensures consistent image handling across the site and leverages Next.js image optimization features.