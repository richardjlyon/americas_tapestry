import fs from "fs"
import path from "path"
import matter from "gray-matter"

export interface TeamMember {
  slug: string
  name: string
  role: string
  content: string
  order: number
  groupSlug: string
  imagePath: string
  [key: string]: any // For additional frontmatter fields
}

export interface TeamGroup {
  name: string
  slug: string
  description: string
  longDescription?: string
}

// Team group data to avoid duplication
const teamGroupsData: TeamGroup[] = [
  {
    name: "Project Director",
    slug: "project-director",
    description:
      "The visionary leadership behind America's Tapestry, guiding the project's artistic direction and historical integrity.",
    longDescription:
      "Our Project Director team provides the vision and leadership that drives America's Tapestry forward. With extensive backgrounds in textile arts, cultural history, and museum administration, these dedicated professionals oversee all aspects of the project, from historical research and design to community engagement and exhibition planning. Their expertise ensures that each tapestry panel meets the highest standards of artistic quality and historical accuracy while telling the diverse stories that make up America's cultural heritage.",
  },
  {
    name: "State Directors",
    slug: "state-directors",
    description:
      "Regional leaders who coordinate the creation of state-specific tapestry panels and engage local communities in the project.",
    longDescription:
      "Our State Directors serve as the regional leaders for America's Tapestry, each responsible for coordinating the creation of their state's panel and engaging local communities in the project. These talented individuals bring deep knowledge of their state's history and cultural traditions, along with expertise in textile arts and community organizing. Working with local historical societies, museums, and community groups, they gather stories and design elements that authentically represent their state's unique contribution to America's cultural tapestry.",
  },
  {
    name: "Historical Partners",
    slug: "historical-partners",
    description:
      "Museums, archives, and cultural institutions that provide historical expertise and resources to ensure authenticity.",
    longDescription:
      "Our Historical Partners are the prestigious museums, archives, and cultural institutions that provide America's Tapestry with historical expertise, research resources, and exhibition spaces. These partnerships ensure that our tapestries are grounded in rigorous historical scholarship while reaching broad audiences. From providing access to historical textiles and documents to hosting public programs and workshops, these institutions play a vital role in both the creation and presentation of America's Tapestry.",
  },
  {
    name: "Illustrators",
    slug: "illustrators",
    description: "Artists who create the detailed designs that form the foundation for each tapestry panel.",
    longDescription:
      "Our Illustrators are the talented artists who create the detailed designs that form the foundation for each tapestry panel. Combining artistic vision with historical research, these professionals work closely with historians, community members, and textile artists to develop designs that capture the essence of America's diverse cultural heritage. Their illustrations translate complex historical narratives into visual imagery that can be realized in textile form, balancing aesthetic considerations with the technical requirements of the needlework process.",
  },
  {
    name: "Stitching Groups",
    slug: "stitching-groups",
    description:
      "Collectives of skilled needleworkers who bring the tapestry designs to life through traditional techniques.",
    longDescription:
      "Our Stitching Groups are the collectives of skilled needleworkers who bring the tapestry designs to life through traditional techniques. These groups range from established embroidery guilds with decades of experience to community-based collectives representing diverse cultural traditions. Working collaboratively, they transform illustrations into textile art, applying a wide range of stitching techniques from various cultural traditions. Beyond their technical contributions, these groups serve as community hubs, engaging the public through demonstrations, workshops, and storytelling sessions.",
  },
]

export function getTeamGroups(): TeamGroup[] {
  return teamGroupsData
}

export function getTeamGroup(slug: string): TeamGroup | undefined {
  return teamGroupsData.find((group) => group.slug === slug)
}

// Check if a directory contains an image file
function findImageInDirectory(dirPath: string): string | null {
  if (!fs.existsSync(dirPath)) return null

  const files = fs.readdirSync(dirPath)
  const imageFiles = files.filter((file) => {
    const ext = path.extname(file).toLowerCase()
    return [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext)
  })

  return imageFiles.length > 0 ? imageFiles[0] : null
}

export function getTeamMembersByGroup(group: string): TeamMember[] {
  const groupDirectory = path.join(process.cwd(), `content/team/${group}`)

  if (!fs.existsSync(groupDirectory)) {
    return []
  }

  // Get all subdirectories (one for each team member)
  const memberDirs = fs
    .readdirSync(groupDirectory, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)

  const members = memberDirs
    .map((dirName) => {
      const memberDir = path.join(groupDirectory, dirName)
      const indexFile = path.join(memberDir, "index.md")

      if (!fs.existsSync(indexFile)) {
        return null
      }

      const fileContents = fs.readFileSync(indexFile, "utf8")
      const { data, content } = matter(fileContents)

      // Look for image file in the same directory
      const imageFile = findImageInDirectory(memberDir)
      const imagePath = imageFile ? `/content/team/${group}/${dirName}/${imageFile}` : null

      return {
        slug: dirName,
        content,
        order: data.order || 999,
        groupSlug: group,
        imagePath,
        ...data,
      } as TeamMember
    })
    .filter(Boolean) as TeamMember[]

  // Sort by order field
  return members.sort((a, b) => a.order - b.order)
}

export function getProjectDirector(): TeamMember | null {
  const directors = getTeamMembersByGroup("project-director")
  return directors.length > 0 ? directors[0] : null
}

export function getTeamMember(group: string, slug: string): TeamMember | null {
  const members = getTeamMembersByGroup(group)
  return members.find((member) => member.slug === slug) || null
}

