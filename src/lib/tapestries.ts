import { getAllContent, getContentBySlug } from './content-core';
import fs from 'fs';
import path from 'path';

// Define the possible status values as an enum
export type TapestryStatus =
  | 'Not Started'
  | 'Designed'
  | 'In Production'
  | 'Finished';

// Define the structure for timeline events
export interface TimelineEvent {
  date: string;
  title: string;
  description: string;
}

// Validate that a status is one of the allowed values
export function isValidStatus(status: string): status is TapestryStatus {
  return ['Not Started', 'Designed', 'In Production', 'Finished'].includes(
    status,
  );
}

export interface TapestryEntry {
  slug: string;
  title: string;
  summary: string;
  thumbnail: string;
  background_color: string;
  content: string;
  imagePath?: string;
  audioPath?: string;
  audioDescription?: string;
  colony?: string | null;
  status: TapestryStatus;
  timelineEvents?: TimelineEvent[];
}

// Keep this for backward compatibility with image/audio finding functions (used in helper functions)
// const tapestryDirectory = path.join(process.cwd(), 'content/tapestries');

// Helper function to find image files in a directory
// Updated to prefer optimized responsive variants over original large files
function findImageInDirectory(tapestrySlug: string): string | null {
  // Look in the public/images/tapestries directory instead of content directory
  const publicImagePath = path.join(
    process.cwd(),
    'public/images/tapestries',
    tapestrySlug,
  );

  if (!fs.existsSync(publicImagePath)) return null;

  const files = fs.readdirSync(publicImagePath);

  // Priority order for formats: AVIF > WebP > original files
  const formatPriority = ['.avif', '.webp', '.jpg', '.jpeg', '.png'];

  // Look for main image file, preferring optimized formats
  for (const format of formatPriority) {
    // First try to find responsive variant (1024w is good balance for main images)
    const responsiveMainImage = files.find((file) => {
      const ext = path.extname(file).toLowerCase();
      return (
        ext === format &&
        file.toLowerCase().includes('main') &&
        file.includes('-1024w')
      );
    });

    if (responsiveMainImage) {
      return `/images/tapestries/${tapestrySlug}/${responsiveMainImage}`;
    }

    // Fall back to original main image if no responsive variant
    const originalMainImage = files.find((file) => {
      const ext = path.extname(file).toLowerCase();
      return (
        ext === format &&
        file.toLowerCase().includes('main') &&
        !file.includes('-640w') &&
        !file.includes('-1024w') &&
        !file.includes('-1920w') &&
        !file.includes('-2560w') &&
        !file.includes('-400w') &&
        !file.includes('-1280w') &&
        !file.includes('-200w') &&
        !file.includes('-600w') &&
        !file.includes('-300w') &&
        !file.includes('-900w')
      );
    });

    if (originalMainImage) {
      return `/images/tapestries/${tapestrySlug}/${originalMainImage}`;
    }
  }

  // If no main image found, look for any non-thumbnail image with format priority
  for (const format of formatPriority) {
    // Try responsive variants first
    const responsiveImage = files.find((file) => {
      const ext = path.extname(file).toLowerCase();
      return (
        ext === format &&
        !file.toLowerCase().includes('thumbnail') &&
        file.includes('-1024w')
      );
    });

    if (responsiveImage) {
      return `/images/tapestries/${tapestrySlug}/${responsiveImage}`;
    }

    // Fall back to original files
    const originalImage = files.find((file) => {
      const ext = path.extname(file).toLowerCase();
      return (
        ext === format &&
        !file.toLowerCase().includes('thumbnail') &&
        !file.includes('-640w') &&
        !file.includes('-1024w') &&
        !file.includes('-1920w') &&
        !file.includes('-2560w') &&
        !file.includes('-400w') &&
        !file.includes('-1280w') &&
        !file.includes('-200w') &&
        !file.includes('-600w') &&
        !file.includes('-300w') &&
        !file.includes('-900w')
      );
    });

    if (originalImage) {
      return `/images/tapestries/${tapestrySlug}/${originalImage}`;
    }
  }

  return null;
}

// Helper function to find audio files in a directory
function findAudioInDirectory(tapestrySlug: string): string | null {
  // Look in the public/images/tapestries directory instead of content directory
  const publicImagePath = path.join(
    process.cwd(),
    'public/images/tapestries',
    tapestrySlug,
  );

  if (!fs.existsSync(publicImagePath)) return null;

  const files = fs.readdirSync(publicImagePath);

  // Look for audio description file
  const audioFile = files.find((file) => {
    const ext = path.extname(file).toLowerCase();
    return (
      ['.mp3', '.wav', '.ogg', '.m4a'].includes(ext) &&
      (file.toLowerCase().includes('audio') ||
        file.toLowerCase().includes('description'))
    );
  });

  if (audioFile) {
    return `/images/tapestries/${tapestrySlug}/${audioFile}`;
  }

  return null;
}

// Function to get carousel images as TapestryEntry-like objects
export function getCarouselImages(): TapestryEntry[] {
  try {
    const carouselPath = path.join(process.cwd(), 'public/images/carousel');

    if (!fs.existsSync(carouselPath)) {
      console.warn('Carousel directory not found');
      return [];
    }

    const files = fs.readdirSync(carouselPath);
    const imageFiles = files.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.avif'].includes(ext);
    });

    // Sort files by name to ensure consistent ordering
    imageFiles.sort();

    return imageFiles.map((file, index) => ({
      slug: `carousel-${index + 1}`,
      title: `Carousel Image ${index + 1}`,
      summary: '',
      thumbnail: `/images/carousel/${file}`,
      background_color: 'bg-colonial-navy',
      content: '',
      imagePath: `/images/carousel/${file}`,
      audioPath: undefined,
      audioDescription: '',
      colony: null,
      status: 'In Progress' as TapestryStatus,
      timelineEvents: [],
    }));
  } catch (error) {
    console.error('Error loading carousel images:', error);
    return [];
  }
}

export async function getAllTapestries(): Promise<TapestryEntry[]> {
  try {
    // Use content-core to get all tapestry content
    const tapestryContent = await getAllContent('tapestries');

    const tapestries: TapestryEntry[] = [];

    for (const item of tapestryContent) {
      const data = item.frontmatter;
      const content = item.content;
      const slug = item.slug;

      // Validate status or set default
      const status =
        data['status'] && isValidStatus(data['status'])
          ? data['status']
          : 'Not Started';

      // Find the main image in the directory
      const imagePath = findImageInDirectory(slug);

      // Find audio description file
      const audioPath = findAudioInDirectory(slug);

      // Construct the thumbnail path - either from frontmatter or by convention
      // Updated to prefer optimized responsive variants over original files
      let thumbnail = data['thumbnail'];
      if (!thumbnail) {
        // Look for thumbnail in the public images directory
        const publicImagePath = path.join(
          process.cwd(),
          'public/images/tapestries',
          slug,
        );

        if (fs.existsSync(publicImagePath)) {
          const files = fs.readdirSync(publicImagePath);
          const formatPriority = ['.avif', '.webp', '.jpg', '.jpeg', '.png'];

          // Find optimized thumbnail variants first
          for (const format of formatPriority) {
            // Try responsive thumbnail variants (640w is good for thumbnails)
            const responsiveThumbnail = files.find((file) => {
              const ext = path.extname(file).toLowerCase();
              return (
                ext === format &&
                file.toLowerCase().includes('thumbnail') &&
                file.includes('-640w')
              );
            });

            if (responsiveThumbnail) {
              thumbnail = `/images/tapestries/${slug}/${responsiveThumbnail}`;
              break;
            }

            // Fall back to original thumbnail
            const originalThumbnail = files.find((file) => {
              const ext = path.extname(file).toLowerCase();
              return (
                ext === format &&
                file.toLowerCase().includes('thumbnail') &&
                !file.includes('-640w') &&
                !file.includes('-1024w') &&
                !file.includes('-1920w') &&
                !file.includes('-2560w') &&
                !file.includes('-400w') &&
                !file.includes('-1280w') &&
                !file.includes('-200w') &&
                !file.includes('-600w') &&
                !file.includes('-300w') &&
                !file.includes('-900w')
              );
            });

            if (originalThumbnail) {
              thumbnail = `/images/tapestries/${slug}/${originalThumbnail}`;
              break;
            }
          }

          // If no thumbnail found, use main image as fallback
          if (!thumbnail && imagePath) {
            thumbnail = imagePath;
          } else if (!thumbnail) {
            // Use placeholder as last resort
            thumbnail =
              '/images/placeholders/tapestry-placeholder.svg?height=600&width=800';
          }
        } else {
          // Use placeholder as last resort
          thumbnail =
            '/images/placeholders/tapestry-placeholder.svg?height=600&width=800';
        }
      }

      // Return the tapestry entry
      tapestries.push({
        slug,
        title: data['title'],
        summary: data['summary'],
        thumbnail: thumbnail || imagePath, // Use main image as fallback if no thumbnail
        background_color: data['background_color'],
        content,
        imagePath,
        audioPath,
        audioDescription:
          data['audioDescription'] ||
          `Audio description of the ${data['title']} tapestry`,
        colony: data['colony'] || null,
        status,
        timelineEvents: data['timelineEvents'] || [],
      } as TapestryEntry);
    }

    // Sort tapestries by title
    return tapestries.sort((a, b) => a.title.localeCompare(b.title));
  } catch (error) {
    console.error('Error getting all tapestries:', error);
    return [];
  }
}

export async function getTapestryBySlug(
  slug: string,
): Promise<TapestryEntry | null> {
  try {
    // Use content-core to get the specific tapestry content
    const tapestryItem = await getContentBySlug('tapestries', slug);

    if (!tapestryItem) {
      return null;
    }

    const data = tapestryItem.frontmatter;
    const content = tapestryItem.content;

    // Validate status or set default
    const status =
      data['status'] && isValidStatus(data['status'])
        ? data['status']
        : 'Not Started';

    // Find the main image in the directory
    const imagePath = findImageInDirectory(slug);

    // Find audio description file
    const audioPath = findAudioInDirectory(slug);

    // Construct the thumbnail path - either from frontmatter or by convention
    let thumbnail = data['thumbnail'];
    if (!thumbnail) {
      // Look for thumbnail in the public images directory
      const publicImagePath = path.join(
        process.cwd(),
        'public/images/tapestries',
        slug,
      );

      if (fs.existsSync(publicImagePath)) {
        const thumbnailFile = fs
          .readdirSync(publicImagePath)
          .find((file) => file.toLowerCase().includes('thumbnail'));

        if (thumbnailFile) {
          thumbnail = `/images/tapestries/${slug}/${thumbnailFile}`;
        } else if (imagePath) {
          // Use main image as fallback if available
          thumbnail = imagePath;
        } else {
          // Use placeholder as last resort
          thumbnail = '/images/placeholders/placeholder.svg';
        }
      } else {
        // Use placeholder as last resort
        thumbnail = '/images/placeholders/placeholder.svg';
      }
    }

    return {
      slug,
      title: data['title'],
      summary: data['summary'],
      thumbnail: thumbnail || imagePath, // Use main image as fallback if no thumbnail
      background_color: data['background_color'],
      content,
      imagePath,
      audioPath,
      audioDescription:
        data['audioDescription'] ||
        `Audio description of the ${data['title']} tapestry`,
      colony: data['colony'] || null,
      status,
      timelineEvents: data['timelineEvents'] || [],
    } as TapestryEntry;
  } catch (error) {
    console.error(`Error getting tapestry ${slug}:`, error);
    return null;
  }
}
