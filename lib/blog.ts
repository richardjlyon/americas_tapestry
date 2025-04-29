import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  category: string;
  featured: boolean;
  image: string;
  excerpt: string;
  content: string;
  author?: string;
  videoUrl?: string;
}

// Update the BlogCategory type to include "videos"
export type BlogCategory =
  | 'project-updates'
  | 'historical-insights'
  | 'event-information'
  | 'press-releases'
  | 'behind-the-scenes'
  | 'videos';

export interface CategoryInfo {
  name: string;
  slug: BlogCategory;
  description: string;
}

// Add the new category to the blogCategories array
export const blogCategories: CategoryInfo[] = [
  {
    name: 'Project Updates',
    slug: 'project-updates',
    description:
      "The latest developments and progress on America's Tapestry panels and exhibitions.",
  },
  {
    name: 'Historical Insights',
    slug: 'historical-insights',
    description:
      'Explorations of the historical events, figures, and cultural contexts depicted in our tapestries.',
  },
  {
    name: 'Event Information',
    slug: 'event-information',
    description:
      'Announcements about upcoming exhibitions, workshops, lectures, and community events.',
  },
  {
    name: 'Press Releases',
    slug: 'press-releases',
    description:
      "Official announcements and media coverage of America's Tapestry.",
  },
  {
    name: 'Behind the Scenes',
    slug: 'behind-the-scenes',
    description:
      "A look at the creative process, techniques, and people bringing America's Tapestry to life.",
  },
  {
    name: 'Videos',
    slug: 'videos',
    description:
      "Video content showcasing the America's Tapestry project, including interviews, demonstrations, and documentary footage.",
  },
];

const newsDirectory = path.join(process.cwd(), 'content/news');

// Extract slug from filename (remove date prefix)
function slugFromFilename(filename: string): string {
  // Remove the YYMMDD- prefix and .md extension
  const slug = filename.replace(/^\d{6}-/, '').replace(/\.md$/, '');
  console.log(`Slug extraction: ${filename} -> ${slug}`);
  return slug;
}

// Function to convert image paths to the public directory structure
function convertImagePath(imagePath: string | undefined): string {
  if (!imagePath) return '/placeholder.svg';
  
  // If path is already using the new /images/ format, leave it as is
  if (imagePath.startsWith('/images/')) {
    return imagePath;
  }
  
  // If the path starts with /content/, convert to public directory format
  if (imagePath.startsWith('/content/')) {
    // Try to infer the content directory from the path
    const pathParts = imagePath.split('/');
    if (pathParts.length >= 3) {
      const contentType = pathParts[2]; // e.g., 'news', 'tapestries', etc.
      return imagePath.replace(`/content/${contentType}/`, `/images/${contentType}/`);
    }
    
    // If we can't infer the content type, use a general replacement
    return imagePath.replace('/content/', '/images/');
  }
  
  // For relative paths, prefix with /images/news/
  if (!imagePath.startsWith('/') && !imagePath.startsWith('http')) {
    return `/images/news/${imagePath}`;
  }
  
  // If it's an absolute path to a placeholder or external URL, leave it as is
  return imagePath;
}

// Get all blog posts across all categories
export function getAllBlogPosts(): BlogPost[] {
  // Ensure the directory exists
  if (!fs.existsSync(newsDirectory)) {
    console.warn(`News directory not found: ${newsDirectory}`);
    return [];
  }

  const allPosts: BlogPost[] = [];

  // Loop through each category directory
  for (const category of blogCategories) {
    const categoryDir = path.join(newsDirectory, category.slug);

    // Skip if category directory doesn't exist
    if (!fs.existsSync(categoryDir)) {
      continue;
    }

    // Get all markdown files in this category
    const filenames = fs
      .readdirSync(categoryDir)
      .filter((filename) => filename.endsWith('.md'));

    // Process each file
    for (const filename of filenames) {
      // Extract slug from filename, ensuring we get the full slug without date prefix
      const slug = slugFromFilename(filename);
      console.log(`Processing file: ${filename}, extracted slug: ${slug}`);
      const fullPath = path.join(categoryDir, filename);

      try {
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);

        // Extract date from filename if not in frontmatter
        let postDate = data.date;
        if (!postDate) {
          // Extract YYMMDD from filename
          const dateMatch = filename.match(/^(\d{6})/);
          if (dateMatch) {
            const dateStr = dateMatch[1];
            // Convert YYMMDD to YYYY-MM-DD
            const year = '20' + dateStr.substring(0, 2);
            const month = dateStr.substring(2, 4);
            const day = dateStr.substring(4, 6);
            postDate = `${year}-${month}-${day}`;
          }
        }

        // Convert image path to content directory
        const imagePath = convertImagePath(data.image);

        allPosts.push({
          slug,
          title: data.title || '',
          date: postDate || '',
          excerpt: data.excerpt || '',
          category: category.slug,
          featured: data.featured || false,
          image: imagePath,
          content,
          author: data.author || null,
          videoUrl: data.videoUrl || undefined,
        });
      } catch (error) {
        console.error(`Error processing ${fullPath}:`, error);
      }
    }
  }

  // Sort posts by date (newest first)
  return allPosts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

// Get a single blog post by slug
export function getBlogPostBySlug(slug: string): BlogPost | null {
  // We need to search in all category directories
  for (const category of blogCategories) {
    const categoryDir = path.join(newsDirectory, category.slug);

    // Skip if category directory doesn't exist
    if (!fs.existsSync(categoryDir)) {
      continue;
    }

    // Look for files that end with the slug (more robust matching)
    const files = fs
      .readdirSync(categoryDir)
      .filter((filename) => {
        const fileSlug = slugFromFilename(filename);
        const match = fileSlug === slug;
        console.log(`Comparing: fileSlug '${fileSlug}' with requested slug '${slug}', match: ${match}`);
        return match;
      });

    if (files.length > 0) {
      const filename = files[0];
      const fullPath = path.join(categoryDir, filename);

      try {
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);

        // Extract date from filename if not in frontmatter
        let postDate = data.date;
        if (!postDate) {
          // Extract YYMMDD from filename
          const dateMatch = filename.match(/^(\d{6})/);
          if (dateMatch) {
            const dateStr = dateMatch[1];
            // Convert YYMMDD to YYYY-MM-DD
            const year = '20' + dateStr.substring(0, 2);
            const month = dateStr.substring(2, 4);
            const day = dateStr.substring(4, 6);
            postDate = `${year}-${month}-${day}`;
          }
        }
        
        // Convert image path to content directory
        const imagePath = convertImagePath(data.image);

        return {
          slug,
          title: data.title || '',
          date: postDate || '',
          excerpt: data.excerpt || '',
          category: category.slug,
          featured: data.featured || false,
          image: imagePath,
          content,
          author: data.author || null,
          videoUrl: data.videoUrl || undefined,
        };
      } catch (error) {
        console.error(`Error processing ${fullPath}:`, error);
      }
    }
  }

  return null;
}

// Get featured blog posts
export function getFeaturedBlogPosts(): BlogPost[] {
  const allPosts = getAllBlogPosts();
  return allPosts.filter((post) => post.featured);
}

// Get latest blog posts
export function getLatestBlogPosts(count = 3): BlogPost[] {
  const allPosts = getAllBlogPosts();
  return allPosts.slice(0, count);
}

// Get blog posts by category
export function getBlogPostsByCategory(category: BlogCategory): BlogPost[] {
  const allPosts = getAllBlogPosts();
  return allPosts.filter((post) => post.category === category);
}

// Get category info by slug
export function getCategoryBySlug(slug: string): CategoryInfo | undefined {
  return blogCategories.find((category) => category.slug === slug);
}