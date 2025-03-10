import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface TeamMember {
  slug: string;
  name: string;
  role: string;
  content: string;
  groupSlug: string;
  imagePosition?: string; // Control image positioning (e.g., "center", "top", "left 30% center")
  [key: string]: any; // For additional frontmatter fields
}

export interface TeamGroup {
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  order?: number;
  [key: string]: any; // For additional frontmatter fields
}

// Read team group data from the directory structure
export function getTeamGroup(slug: string): TeamGroup | undefined {
  const groupDir = path.join(process.cwd(), `content/team/${slug}`);
  const indexFile = path.join(groupDir, 'index.md');
  
  if (!fs.existsSync(indexFile)) {
    console.warn(`No index.md found for team group: ${slug}`);
    return undefined;
  }
  
  try {
    const fileContents = fs.readFileSync(indexFile, 'utf8');
    const { data, content } = matter(fileContents);
    
    return {
      name: data.name,
      slug: slug,
      description: data.description,
      longDescription: content.trim(),
      order: data.order,
      ...data // Include any additional frontmatter fields
    } as TeamGroup;
  } catch (error) {
    console.error(`Error reading team group ${slug}:`, error);
    return undefined;
  }
}

export function getTeamGroups(): TeamGroup[] {
  const teamDir = path.join(process.cwd(), 'content/team');
  
  if (!fs.existsSync(teamDir)) {
    console.warn('Team directory not found');
    return [];
  }
  
  try {
    // Get all directories that contain an index.md file
    const groupDirs = fs
      .readdirSync(teamDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
      .filter(dir => {
        const indexPath = path.join(teamDir, dir, 'index.md');
        return fs.existsSync(indexPath);
      });
    
    const groups = groupDirs
      .map(slug => getTeamGroup(slug))
      .filter(Boolean) as TeamGroup[];
    
    // Sort by order field
    return groups.sort((a, b) => (a.order || 999) - (b.order || 999));
  } catch (error) {
    console.error('Error reading team groups:', error);
    return [];
  }
}

// Generate image path based on member slug and group slug
function getTeamMemberImagePath(groupSlug: string, memberSlug: string): string {
  return `/images/team/${groupSlug}/${memberSlug}.jpg`;
}

export function getTeamMembersByGroup(group: string): TeamMember[] {
  const groupDirectory = path.join(process.cwd(), `content/team/${group}`);

  if (!fs.existsSync(groupDirectory)) {
    return [];
  }

  // Filter out the index.md file itself from the group directory
  const memberDirs = fs
    .readdirSync(groupDirectory, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  const members = memberDirs
    .map((dirName) => {
      const memberDir = path.join(groupDirectory, dirName);
      const indexFile = path.join(memberDir, 'index.md');

      if (!fs.existsSync(indexFile)) {
        return null;
      }

      const fileContents = fs.readFileSync(indexFile, 'utf8');
      const { data, content } = matter(fileContents);

      // Construct the image path based on the directory structure
      const imagePath = `/images/team/${group}/${dirName}/${dirName}.jpg`;
      
      return {
        slug: dirName,
        content,
        groupSlug: group,
        imagePath,
        ...data,
      } as TeamMember;
    })
    .filter(Boolean) as TeamMember[];

  // Sort by order field if present, or by name
  return members.sort((a, b) => {
    // If both have order, use that
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    // If only one has order, prioritize that one
    if (a.order !== undefined) return -1;
    if (b.order !== undefined) return 1;
    
    // If both have names, compare them
    if (a.name && b.name) {
      return a.name.localeCompare(b.name);
    }
    
    // Handle cases where name might be undefined
    if (a.name) return -1;
    if (b.name) return 1;
    
    // If both missing names, keep original order
    return 0;
  });
}

export function getProjectDirector(): TeamMember | null {
  const directors = getTeamMembersByGroup('project-director');
  return directors.length > 0 ? directors[0] : null;
}

export function getTeamMember(group: string, slug: string): TeamMember | null {
  const members = getTeamMembersByGroup(group);
  return members.find((member) => member.slug === slug) || null;
}
