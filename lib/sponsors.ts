import fs from "fs"
import path from "path"
import matter from "gray-matter"

export interface Sponsor {
  slug: string
  name: string
  tier: "Platinum" | "Gold" | "Silver" | "Bronze"
  website: string
  location: string
  partnership_year: number
  logo: string
  logoPath: string
  order: number
  content: string
  excerpt: string
}

// Get all sponsors sorted by tier and order
export function getAllSponsors(): Sponsor[] {
  const sponsorsDirectory = path.join(process.cwd(), "content/sponsors")

  // Get all directories in the sponsors directory (excluding README.md)
  const sponsorFolders = fs
    .readdirSync(sponsorsDirectory, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)

  const sponsors = sponsorFolders
    .map((folder) => {
      // Use the folder name as the slug
      const slug = folder

      // Get the full path to the folder
      const folderPath = path.join(sponsorsDirectory, folder)

      // Read the index.md file
      const indexPath = path.join(folderPath, "index.md")

      if (!fs.existsSync(indexPath)) {
        console.warn(`No index.md found in ${folderPath}`)
        return null
      }

      const fileContents = fs.readFileSync(indexPath, "utf8")

      // Parse the frontmatter and content
      const { data, content } = matter(fileContents)

      // Find the logo file path
      const logoPath = data.logo ? `/content/sponsors/${folder}/${data.logo}` : "/placeholder.svg?height=200&width=400"

      // Create an excerpt from the content (first paragraph)
      const excerpt = content
        .split("\n\n")[0]
        .replace(/^#+\s+.*\n/, "")
        .trim()

      // Return the sponsor data
      return {
        slug,
        name: data.name,
        tier: data.tier,
        website: data.website,
        location: data.location,
        partnership_year: data.partnership_year,
        logo: data.logo,
        logoPath,
        order: data.order || 999,
        content,
        excerpt,
      } as Sponsor
    })
    .filter(Boolean) as Sponsor[]

  // Sort sponsors by tier (Platinum > Gold > Silver > Bronze) and then by order
  const tierOrder = { Platinum: 1, Gold: 2, Silver: 3, Bronze: 4 }

  return sponsors.sort((a, b) => {
    // First sort by tier
    const tierDiff = tierOrder[a.tier] - tierOrder[b.tier]
    if (tierDiff !== 0) return tierDiff

    // Then sort by order
    return a.order - b.order
  })
}

// Get a single sponsor by slug
export function getSponsorBySlug(slug: string): Sponsor | null {
  const sponsorsDirectory = path.join(process.cwd(), "content/sponsors")
  const folderPath = path.join(sponsorsDirectory, slug)
  const indexPath = path.join(folderPath, "index.md")

  if (!fs.existsSync(indexPath)) {
    return null
  }

  const fileContents = fs.readFileSync(indexPath, "utf8")
  const { data, content } = matter(fileContents)

  // Find the logo file path
  const logoPath = data.logo ? `/content/sponsors/${slug}/${data.logo}` : "/placeholder.svg?height=200&width=400"

  // Create an excerpt from the content (first paragraph)
  const excerpt = content
    .split("\n\n")[0]
    .replace(/^#+\s+.*\n/, "")
    .trim()

  return {
    slug,
    name: data.name,
    tier: data.tier,
    website: data.website,
    location: data.location,
    partnership_year: data.partnership_year,
    logo: data.logo,
    logoPath,
    order: data.order || 999,
    content,
    excerpt,
  } as Sponsor
}

