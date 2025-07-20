import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface ContentItem {
  slug: string;
  frontmatter: Record<string, any>;
  content: string;
  excerpt?: string;
}

export interface ContentMetadata {
  slug: string;
  frontmatter: Record<string, any>;
}

/**
 * Core content reading utility - replaces file duplication approach
 * Reads markdown files directly from content/ directory
 */
export async function getAllContent(contentType: string): Promise<ContentItem[]> {
  const contentDirectory = path.join(process.cwd(), 'content', contentType);

  if (!fs.existsSync(contentDirectory)) {
    console.warn(`Content directory not found: ${contentDirectory}`);
    return [];
  }

  const allContent: ContentItem[] = [];

  function processDirectory(dir: string, relativePath = '') {
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      const currentPath = path.join(relativePath, item.name);

      if (item.isDirectory()) {
        // Skip hidden directories and image directories
        if (!item.name.startsWith('.') && item.name !== 'images') {
          processDirectory(fullPath, currentPath);
        }
      } else if (item.name === 'index.md' || item.name.endsWith('.md')) {
        // Skip README files and other non-content markdown
        if (item.name.toLowerCase() === 'readme.md' || 
            item.name.toLowerCase() === 'schema.md' ||
            item.name.toLowerCase() === 'image-guidelines.md') {
          continue;
        }

        try {
          const fileContents = fs.readFileSync(fullPath, 'utf8');
          const { data, content } = matter(fileContents);

          // Extract slug from directory path or filename
          let slug: string;
          if (item.name === 'index.md') {
            // For index.md files, use the parent directory name
            const pathParts = currentPath.split(path.sep);
            pathParts.pop(); // Remove 'index.md'
            slug = pathParts.pop() || '';
          } else {
            // For regular .md files, use filename without extension
            slug = path.basename(item.name, '.md');
          }

          // Generate excerpt if not provided
          let excerpt = data['excerpt'];
          if (!excerpt && content) {
            // Extract first 150 characters of content, removing markdown syntax
            const plainText = content
              .replace(/#{1,6}\s+/g, '') // Remove headers
              .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
              .replace(/\*(.+?)\*/g, '$1') // Remove italic
              .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links
              .replace(/\n+/g, ' ') // Replace newlines with spaces
              .trim();
            
            excerpt = plainText.length > 150 
              ? plainText.substring(0, 150) + '...'
              : plainText;
          }

          allContent.push({
            slug,
            frontmatter: data,
            content,
            excerpt,
          });
        } catch (error) {
          console.error(`Error processing ${fullPath}:`, error);
        }
      }
    }
  }

  processDirectory(contentDirectory);
  return allContent;
}

/**
 * Get content item by slug from a specific content type
 */
export async function getContentBySlug(
  contentType: string,
  slug: string
): Promise<ContentItem | null> {
  const allContent = await getAllContent(contentType);
  return allContent.find(item => item.slug === slug) || null;
}

/**
 * Generate static params for Next.js from content
 */
export async function generateContentStaticParams(
  contentType: string
): Promise<{ slug: string }[]> {
  const content = await getAllContent(contentType);
  return content.map(item => ({ slug: item.slug }));
}

/**
 * Get content metadata only (without full content) - useful for listings
 */
export async function getContentMetadata(contentType: string): Promise<ContentMetadata[]> {
  const contentDirectory = path.join(process.cwd(), 'content', contentType);

  if (!fs.existsSync(contentDirectory)) {
    console.warn(`Content directory not found: ${contentDirectory}`);
    return [];
  }

  const metadata: ContentMetadata[] = [];

  function processDirectory(dir: string, relativePath = '') {
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      const currentPath = path.join(relativePath, item.name);

      if (item.isDirectory()) {
        if (!item.name.startsWith('.') && item.name !== 'images') {
          processDirectory(fullPath, currentPath);
        }
      } else if (item.name === 'index.md' || item.name.endsWith('.md')) {
        if (item.name.toLowerCase() === 'readme.md' || 
            item.name.toLowerCase() === 'schema.md' ||
            item.name.toLowerCase() === 'image-guidelines.md') {
          continue;
        }

        try {
          const fileContents = fs.readFileSync(fullPath, 'utf8');
          const { data } = matter(fileContents);

          let slug: string;
          if (item.name === 'index.md') {
            const pathParts = currentPath.split(path.sep);
            pathParts.pop();
            slug = pathParts.pop() || '';
          } else {
            slug = path.basename(item.name, '.md');
          }

          metadata.push({
            slug,
            frontmatter: data,
          });
        } catch (error) {
          console.error(`Error processing metadata for ${fullPath}:`, error);
        }
      }
    }
  }

  processDirectory(contentDirectory);
  return metadata;
}

/**
 * Enhanced content processing for nested directory structures
 * Handles blog posts with date prefixes and category-based organization
 */
export async function getAllNestedContent(
  contentType: string,
  categories?: string[]
): Promise<ContentItem[]> {
  const contentDirectory = path.join(process.cwd(), 'content', contentType);

  if (!fs.existsSync(contentDirectory)) {
    console.warn(`Content directory not found: ${contentDirectory}`);
    return [];
  }

  const allContent: ContentItem[] = [];

  // If categories are specified, process each category directory
  if (categories && categories.length > 0) {
    for (const category of categories) {
      const categoryDir = path.join(contentDirectory, category);
      
      if (!fs.existsSync(categoryDir)) {
        continue;
      }

      const categoryContent = await processContentDirectory(categoryDir, category);
      allContent.push(...categoryContent);
    }
  } else {
    // Process all subdirectories as categories
    const items = fs.readdirSync(contentDirectory, { withFileTypes: true });
    
    for (const item of items) {
      if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'images') {
        const categoryDir = path.join(contentDirectory, item.name);
        const categoryContent = await processContentDirectory(categoryDir, item.name);
        allContent.push(...categoryContent);
      }
    }
  }

  return allContent;
}

/**
 * Process content in a specific directory
 */
async function processContentDirectory(
  directory: string,
  category?: string
): Promise<ContentItem[]> {
  const content: ContentItem[] = [];

  if (!fs.existsSync(directory)) {
    return content;
  }

  const files = fs.readdirSync(directory, { withFileTypes: true });

  for (const file of files) {
    if (file.isFile() && file.name.endsWith('.md')) {
      const fullPath = path.join(directory, file.name);

      try {
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content: markdownContent } = matter(fileContents);

        // Extract slug, handling date prefixes in filenames
        let slug = path.basename(file.name, '.md');
        
        // Remove date prefix if present (YYMMDD- format)
        if (/^\d{6}-/.test(slug)) {
          slug = slug.replace(/^\d{6}-/, '');
        }

        // Generate excerpt if not provided
        let excerpt = data['excerpt'];
        if (!excerpt && markdownContent) {
          const plainText = markdownContent
            .replace(/#{1,6}\s+/g, '')
            .replace(/\*\*(.+?)\*\*/g, '$1')
            .replace(/\*(.+?)\*/g, '$1')
            .replace(/\[(.+?)\]\(.+?\)/g, '$1')
            .replace(/\n+/g, ' ')
            .trim();
          
          excerpt = plainText.length > 150 
            ? plainText.substring(0, 150) + '...'
            : plainText;
        }

        // Add category to frontmatter if provided
        const enhancedFrontmatter = category 
          ? { ...data, category }
          : data;

        content.push({
          slug,
          frontmatter: enhancedFrontmatter,
          content: markdownContent,
          excerpt,
        });
      } catch (error) {
        console.error(`Error processing ${fullPath}:`, error);
      }
    }
  }

  return content;
}

/**
 * Utility to convert image paths from content/ references to public/images/
 */
export function convertImagePath(imagePath: string | undefined, contentType?: string): string {
  if (!imagePath || imagePath.trim() === '') {
    return '/images/placeholders/placeholder.svg';
  }
  
  // If path is already using the /images/ format, leave it as is
  if (imagePath.startsWith('/images/')) {
    return imagePath;
  }
  
  // If the path starts with /content/, convert to public directory format
  if (imagePath.startsWith('/content/')) {
    return imagePath.replace('/content/', '/images/');
  }
  
  // For relative paths, prefix with appropriate /images/ subdirectory
  if (!imagePath.startsWith('/') && !imagePath.startsWith('http')) {
    const imagePrefix = contentType ? `/images/${contentType}/` : '/images/';
    return `${imagePrefix}${imagePath}`;
  }
  
  // If it's an absolute path or external URL, leave it as is
  return imagePath;
}

/**
 * Extract date from filename with YYMMDD prefix
 */
export function extractDateFromFilename(filename: string): string | null {
  const dateMatch = filename.match(/^(\d{6})/);
  if (dateMatch && dateMatch[1]) {
    const dateStr = dateMatch[1];
    const year = '20' + dateStr.substring(0, 2);
    const month = dateStr.substring(2, 4);
    const day = dateStr.substring(4, 6);
    return `${year}-${month}-${day}`;
  }
  return null;
}