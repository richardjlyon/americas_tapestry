import fs from "fs"
import path from "path"
import matter from "gray-matter"

export interface BlogPost {
  slug: string
  title: string
  date: string
  category: string
  featured: boolean
  image: string
  excerpt: string
  content: string
  author?: string
}

// Update the BlogCategory type to include "videos"
export type BlogCategory =
  | "project-updates"
  | "historical-insights"
  | "event-information"
  | "press-releases"
  | "behind-the-scenes"
  | "videos"

export interface CategoryInfo {
  name: string
  slug: BlogCategory
  description: string
}

// Add the new category to the blogCategories array
export const blogCategories: CategoryInfo[] = [
  {
    name: "Project Updates",
    slug: "project-updates",
    description: "The latest developments and progress on America's Tapestry panels and exhibitions.",
  },
  {
    name: "Historical Insights",
    slug: "historical-insights",
    description: "Explorations of the historical events, figures, and cultural contexts depicted in our tapestries.",
  },
  {
    name: "Event Information",
    slug: "event-information",
    description: "Announcements about upcoming exhibitions, workshops, lectures, and community events.",
  },
  {
    name: "Press Releases",
    slug: "press-releases",
    description: "Official announcements and media coverage of America's Tapestry.",
  },
  {
    name: "Behind the Scenes",
    slug: "behind-the-scenes",
    description: "A look at the creative process, techniques, and people bringing America's Tapestry to life.",
  },
  {
    name: "Videos",
    slug: "videos",
    description:
      "Video content showcasing the America's Tapestry project, including interviews, demonstrations, and documentary footage.",
  },
]

const newsDirectory = path.join(process.cwd(), "content/news")

// Extract slug from filename (remove date prefix)
function slugFromFilename(filename: string): string {
  // Remove the YYMMDD- prefix and .md extension
  return filename.replace(/^\d{6}-/, "").replace(/\.md$/, "")
}

// Get all blog posts across all categories
export function getAllBlogPosts(): BlogPost[] {
  // Ensure the directory exists
  if (!fs.existsSync(newsDirectory)) {
    console.warn(`News directory not found: ${newsDirectory}`)
    return []
  }

  const allPosts: BlogPost[] = []

  // Loop through each category directory
  for (const category of blogCategories) {
    const categoryDir = path.join(newsDirectory, category.slug)

    // Skip if category directory doesn't exist
    if (!fs.existsSync(categoryDir)) {
      continue
    }

    // Get all markdown files in this category
    const filenames = fs.readdirSync(categoryDir).filter((filename) => filename.endsWith(".md"))

    // Process each file
    for (const filename of filenames) {
      const slug = slugFromFilename(filename)
      const fullPath = path.join(categoryDir, filename)

      try {
        const fileContents = fs.readFileSync(fullPath, "utf8")
        const { data, content } = matter(fileContents)

        // Extract date from filename if not in frontmatter
        let postDate = data.date
        if (!postDate) {
          // Extract YYMMDD from filename
          const dateMatch = filename.match(/^(\d{6})/)
          if (dateMatch) {
            const dateStr = dateMatch[1]
            // Convert YYMMDD to YYYY-MM-DD
            const year = "20" + dateStr.substring(0, 2)
            const month = dateStr.substring(2, 4)
            const day = dateStr.substring(4, 6)
            postDate = `${year}-${month}-${day}`
          }
        }

        allPosts.push({
          slug,
          title: data.title || "",
          date: postDate || "",
          excerpt: data.excerpt || "",
          category: category.slug,
          featured: data.featured || false,
          image: data.image || "/placeholder.svg",
          content,
          author: data.author || null,
        })
      } catch (error) {
        console.error(`Error processing ${fullPath}:`, error)
      }
    }
  }

  // Sort posts by date (newest first)
  return allPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

// Get a single blog post by slug
export function getBlogPostBySlug(slug: string): BlogPost | null {
  // We need to search in all category directories
  for (const category of blogCategories) {
    const categoryDir = path.join(newsDirectory, category.slug)

    // Skip if category directory doesn't exist
    if (!fs.existsSync(categoryDir)) {
      continue
    }

    // Look for files that end with the slug
    const files = fs.readdirSync(categoryDir).filter((filename) => filename.endsWith(`${slug}.md`))

    if (files.length > 0) {
      const filename = files[0]
      const fullPath = path.join(categoryDir, filename)

      try {
        const fileContents = fs.readFileSync(fullPath, "utf8")
        const { data, content } = matter(fileContents)

        // Extract date from filename if not in frontmatter
        let postDate = data.date
        if (!postDate) {
          // Extract YYMMDD from filename
          const dateMatch = filename.match(/^(\d{6})/)
          if (dateMatch) {
            const dateStr = dateMatch[1]
            // Convert YYMMDD to YYYY-MM-DD
            const year = "20" + dateStr.substring(0, 2)
            const month = dateStr.substring(2, 4)
            const day = dateStr.substring(4, 6)
            postDate = `${year}-${month}-${day}`
          }
        }

        return {
          slug,
          title: data.title || "",
          date: postDate || "",
          excerpt: data.excerpt || "",
          category: category.slug,
          featured: data.featured || false,
          image: data.image || "/placeholder.svg",
          content,
          author: data.author || null,
        }
      } catch (error) {
        console.error(`Error processing ${fullPath}:`, error)
      }
    }
  }

  return null
}

// Get featured blog posts
export function getFeaturedBlogPosts(): BlogPost[] {
  const allPosts = getAllBlogPosts()
  return allPosts.filter((post) => post.featured)
}

// Get latest blog posts
export function getLatestBlogPosts(count = 3): BlogPost[] {
  const allPosts = getAllBlogPosts()
  return allPosts.slice(0, count)
}

// Get blog posts by category
export function getBlogPostsByCategory(category: BlogCategory): BlogPost[] {
  const allPosts = getAllBlogPosts()
  return allPosts.filter((post) => post.category === category)
}

// Get category info by slug
export function getCategoryBySlug(slug: string): CategoryInfo | undefined {
  return blogCategories.find((category) => category.slug === slug)
}

