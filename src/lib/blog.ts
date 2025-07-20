import { getAllNestedContent, convertImagePath, extractDateFromFilename } from './content-core';

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


// Get all blog posts across all categories
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  try {
    // Get category slugs for nested content processing
    const categoryList = blogCategories.map(cat => cat.slug);
    
    // Use the new content-core utility to get all nested content
    const allContentItems = await getAllNestedContent('news', categoryList);

    const allPosts: BlogPost[] = [];

    for (const item of allContentItems) {
      try {
        const data = item.frontmatter;
        const content = item.content;

        // Extract date from frontmatter or use filename extraction
        let postDate = data['date'];
        if (!postDate) {
          // Try to extract from slug if it has date prefix
          const extractedDate = extractDateFromFilename(item.slug);
          postDate = extractedDate;
        }

        // Convert image path to public directory structure
        let imagePath = convertImagePath(data['image'], 'news');
        
        // Fix image paths to remove redundant 'images/' segment
        if (imagePath) {
          imagePath = imagePath.replace('/images/news/images/', '/images/news/');
          imagePath = imagePath.replace('/images/images/', '/images/');
        }

        // Extract category from frontmatter (set by content-core)
        const category = data['category'] || 'project-updates';

        allPosts.push({
          slug: item.slug,
          title: data['title'] || '',
          date: postDate || '',
          excerpt: item.excerpt || data['excerpt'] || '',
          category: category as BlogCategory,
          featured: data['featured'] || false,
          image: imagePath,
          content,
          author: data['author'] || null,
          videoUrl: data['videoUrl'] || undefined,
        });
      } catch (error) {
        console.error(`Error processing blog post ${item.slug}:`, error);
      }
    }

    // Sort posts by date (newest first)
    return allPosts.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  } catch (error) {
    console.error('Error getting all blog posts:', error);
    return [];
  }
}

// Get a single blog post by slug
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    // Search through all categories to find the blog post
    for (const category of blogCategories) {
      const categoryContent = await getAllNestedContent('news', [category.slug]);
      
      // Find the post with matching slug
      const matchingPost = categoryContent.find(item => item.slug === slug);
      
      if (matchingPost) {
        const data = matchingPost.frontmatter;
        const content = matchingPost.content;

        // Extract date from frontmatter or filename
        let postDate = data['date'];
        if (!postDate) {
          const extractedDate = extractDateFromFilename(slug);
          postDate = extractedDate;
        }
        
        // Convert image path to public directory
        let imagePath = convertImagePath(data['image'], 'news');
        
        // Fix image paths to remove redundant 'images/' segment
        if (imagePath) {
          imagePath = imagePath.replace('/images/news/images/', '/images/news/');
          imagePath = imagePath.replace('/images/images/', '/images/');
        }

        return {
          slug,
          title: data['title'] || '',
          date: postDate || '',
          excerpt: matchingPost.excerpt || data['excerpt'] || '',
          category: category.slug,
          featured: data['featured'] || false,
          image: imagePath,
          content,
          author: data['author'] || null,
          videoUrl: data['videoUrl'] || undefined,
        };
      }
    }

    return null;
  } catch (error) {
    console.error(`Error getting blog post by slug ${slug}:`, error);
    return null;
  }
}

// Get featured blog posts
export async function getFeaturedBlogPosts(): Promise<BlogPost[]> {
  const allPosts = await getAllBlogPosts();
  return allPosts.filter((post) => post.featured);
}

// Get latest blog posts
export async function getLatestBlogPosts(count = 3): Promise<BlogPost[]> {
  const allPosts = await getAllBlogPosts();
  return allPosts.slice(0, count);
}

// Get blog posts by category
export async function getBlogPostsByCategory(category: BlogCategory): Promise<BlogPost[]> {
  const allPosts = await getAllBlogPosts();
  return allPosts.filter((post) => post.category === category);
}

// Get category info by slug
export function getCategoryBySlug(slug: string): CategoryInfo | undefined {
  return blogCategories.find((category) => category.slug === slug);
}