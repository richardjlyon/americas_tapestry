import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

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

const tapestryDirectory = path.join(process.cwd(), 'content/tapestries');

// Helper function to find image files in a directory
function findImageInDirectory(dirPath: string, prefix = ''): string | null {
  if (!fs.existsSync(dirPath)) return null;

  const files = fs.readdirSync(dirPath);

  // Look for main image file (typically has "main" in the filename)
  const mainImage = files.find((file) => {
    const ext = path.extname(file).toLowerCase();
    return (
      ['.jpg', '.jpeg', '.png', '.webp'].includes(ext) &&
      file.toLowerCase().includes('main')
    );
  });

  if (mainImage) {
    // Extract the tapestry slug from the directory path
    const folderName = path.basename(dirPath);
    // Construct path for public directory - we want /images/tapestries/{slug}/{filename}
    return `/images/tapestries/${folderName}/${mainImage}`;
  }

  // If no main image found, return the first image file
  const imageFile = files.find((file) => {
    const ext = path.extname(file).toLowerCase();
    return (
      ['.jpg', '.jpeg', '.png', '.webp'].includes(ext) &&
      !file.toLowerCase().includes('thumbnail')
    );
  });

  if (imageFile) {
    const folderName = path.basename(dirPath);
    return `/images/tapestries/${folderName}/${imageFile}`;
  }

  return null;
}

// Helper function to find audio files in a directory
function findAudioInDirectory(dirPath: string, prefix = ''): string | null {
  if (!fs.existsSync(dirPath)) return null;

  const files = fs.readdirSync(dirPath);

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
    const folderName = path.basename(dirPath);
    return `/images/tapestries/${folderName}/${audioFile}`;
  }

  return null;
}

export function getAllTapestries(): TapestryEntry[] {
  // Get all directories in the tapestry directory
  const tapestryFolders = fs
    .readdirSync(tapestryDirectory, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  // Read each folder and parse its index.md file
  const tapestries = tapestryFolders
    .map((folderName) => {
      // Use the folder name as the slug
      const slug = folderName;

      // Get the full path to the folder
      const folderPath = path.join(tapestryDirectory, folderName);

      // Read the index.md file
      const indexPath = path.join(folderPath, 'index.md');

      if (!fs.existsSync(indexPath)) {
        console.warn(`No index.md found in ${folderPath}`);
        return null;
      }

      const fileContents = fs.readFileSync(indexPath, 'utf8');

      // Parse the frontmatter
      const { data, content } = matter(fileContents);

      // Validate status or set default
      const status =
        data.status && isValidStatus(data.status) ? data.status : 'Not Started';

      // Find the main image in the directory
      const imagePath = findImageInDirectory(folderPath, 'images');

      // Find audio description file
      const audioPath = findAudioInDirectory(folderPath, 'images');

      // Construct the thumbnail path - either from frontmatter or by convention
      let thumbnail = data.thumbnail;
      if (!thumbnail) {
        // Look for thumbnail in the directory
        const thumbnailFile = fs
          .readdirSync(folderPath)
          .find((file) => file.toLowerCase().includes('thumbnail'));

        if (thumbnailFile) {
          // Use the slug which is also the folder name
          thumbnail = `/images/tapestries/${slug}/${thumbnailFile}`;
        } else if (imagePath) {
          // Use main image as fallback if available
          thumbnail = imagePath;
        } else {
          // Use placeholder as last resort
          thumbnail = '/tapestry-placeholder.svg?height=600&width=800';
        }
      }

      // Return the tapestry entry
      return {
        slug,
        title: data.title,
        summary: data.summary,
        thumbnail: thumbnail || imagePath, // Use main image as fallback if no thumbnail
        background_color: data.background_color,
        content,
        imagePath,
        audioPath,
        audioDescription:
          data.audioDescription ||
          `Audio description of the ${data.title} tapestry`,
        colony: data.colony || null,
        status,
        timelineEvents: data.timelineEvents || [],
      } as TapestryEntry;
    })
    .filter(Boolean) as TapestryEntry[];

  // Sort tapestries by title
  return tapestries.sort((a, b) => a.title.localeCompare(b.title));
}

export function getTapestryBySlug(slug: string): TapestryEntry | null {
  try {
    const folderPath = path.join(tapestryDirectory, slug);
    const indexPath = path.join(folderPath, 'index.md');

    if (!fs.existsSync(indexPath)) {
      return null;
    }

    const fileContents = fs.readFileSync(indexPath, 'utf8');
    const { data, content } = matter(fileContents);

    // Validate status or set default
    const status =
      data.status && isValidStatus(data.status) ? data.status : 'Not Started';

    // Find the main image in the directory
    const imagePath = findImageInDirectory(folderPath, 'images');

    // Find audio description file
    const audioPath = findAudioInDirectory(folderPath, 'images');

    // Construct the thumbnail path - either from frontmatter or by convention
    let thumbnail = data.thumbnail;
    if (!thumbnail) {
      // Look for thumbnail in the directory
      const thumbnailFile = fs
        .readdirSync(folderPath)
        .find((file) => file.toLowerCase().includes('thumbnail'));

      if (thumbnailFile) {
        thumbnail = `/images/tapestries/${slug}/${thumbnailFile}`;
      } else if (imagePath) {
        // Use main image as fallback if available
        thumbnail = imagePath;
      } else {
        // Use placeholder as last resort
        thumbnail = '/placeholder.svg';
      }
    }

    return {
      slug,
      title: data.title,
      summary: data.summary,
      thumbnail: thumbnail || imagePath, // Use main image as fallback if no thumbnail
      background_color: data.background_color,
      content,
      imagePath,
      audioPath,
      audioDescription:
        data.audioDescription ||
        `Audio description of the ${data.title} tapestry`,
      colony: data.colony || null,
      status,
      timelineEvents: data.timelineEvents || [],
    } as TapestryEntry;
  } catch (error) {
    console.error(`Error getting tapestry ${slug}:`, error);
    return null;
  }
}

// Add this debug function at the end of the file
export function debugTapestryColonies() {
  const tapestries = getAllTapestries();
  console.log('All tapestries with their slugs:');
  tapestries.forEach((tapestry) => {
    console.log(
      `Slug: ${tapestry.slug}, Title: ${tapestry.title}, Status: ${tapestry.status}`,
    );
  });
  return tapestries;
}
