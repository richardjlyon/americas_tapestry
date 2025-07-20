import { getAllContent, getAllNestedContent } from './content-core';
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
  state?: string; // Single state assignment
  states?: string[]; // Multiple state assignments
  moreInformation?: string;
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

// Specialized function to get team content for a specific group
// Handles both group index files and individual member files
async function getTeamContentForGroup(group: string) {
  const groupDirectory = path.join(process.cwd(), 'content', 'team', group);
  
  if (!fs.existsSync(groupDirectory)) {
    console.warn(`Team group directory not found: ${groupDirectory}`);
    return [];
  }

  const content: any[] = [];
  const items = fs.readdirSync(groupDirectory, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(groupDirectory, item.name);

    if (item.isFile() && item.name === 'index.md') {
      // This is the group index file
      try {
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content: markdownContent } = matter(fileContents);
        
        content.push({
          slug: group, // Group index gets the group name as slug
          frontmatter: data,
          content: markdownContent
        });
      } catch (error) {
        console.error(`Error processing group index ${fullPath}:`, error);
      }
    } else if (item.isDirectory()) {
      // This should be a member directory
      const memberIndexPath = path.join(fullPath, 'index.md');
      
      if (fs.existsSync(memberIndexPath)) {
        try {
          const fileContents = fs.readFileSync(memberIndexPath, 'utf8');
          const { data, content: markdownContent } = matter(fileContents);
          
          content.push({
            slug: item.name, // Member gets their directory name as slug
            frontmatter: data,
            content: markdownContent
          });
        } catch (error) {
          console.error(`Error processing member ${memberIndexPath}:`, error);
        }
      }
    }
  }

  return content;
}

// Read team group data from the directory structure
export async function getTeamGroup(slug: string): Promise<TeamGroup | undefined> {
  try {
    // Use content-core to get the team group index content
    const teamContent = await getAllContent('team');
    
    // Find the group's index content by looking for slug match
    const groupContent = teamContent.find(item => {
      // Check if this is a group index file by checking the path structure
      // Groups have index.md files directly in their directories
      return item.slug === slug;
    });

    if (!groupContent) {
      console.warn(`No team group found: ${slug}`);
      return undefined;
    }

    const data = groupContent.frontmatter;
    const content = groupContent.content;

    return {
      name: data['name'],
      slug: slug,
      description: data['description'],
      longDescription: content.trim(),
      order: data['order'],
      ...data, // Include any additional frontmatter fields
    } as TeamGroup;
  } catch (error) {
    console.error(`Error reading team group ${slug}:`, error);
    return undefined;
  }
}

export async function getTeamGroups(): Promise<TeamGroup[]> {
  try {
    // Use content-core to get all team content
    const teamContent = await getAllContent('team');

    // Filter for group index files - these should be at the top level of each group directory
    // and contain group metadata like name, description, order
    const groupIndexItems = teamContent.filter(item => {
      // Look for items that have group-specific frontmatter
      return item.frontmatter['name'] && item.frontmatter['description'];
    });

    const groups: TeamGroup[] = [];

    for (const item of groupIndexItems) {
      const data = item.frontmatter;
      const content = item.content;

      groups.push({
        name: data['name'],
        slug: item.slug,
        description: data['description'],
        longDescription: content.trim(),
        order: data['order'],
        ...data, // Include any additional frontmatter fields
      } as TeamGroup);
    }

    // Sort by order field
    return groups.sort((a, b) => (a.order || 999) - (b.order || 999));
  } catch (error) {
    console.error('Error reading team groups:', error);
    return [];
  }
}


export async function getTeamMembersByGroup(group: string): Promise<TeamMember[]> {
  try {
    // Get all team content for this specific group using direct directory processing
    const groupSpecificContent = await getTeamContentForGroup(group);

    const members: TeamMember[] = [];

    for (const item of groupSpecificContent) {
      const data = item.frontmatter;
      const content = item.content;

      // Skip if this looks like a group index file rather than a member
      // Group index files have description but no role (they describe the group, not a person)
      // OR if the slug matches the group name (alternative slug generation)
      if ((data['description'] && !data['role']) || item.slug === group) {
        continue;
      }

      // Team image paths are handled by the component using getImageSrc()

      // Check if required fields exist in data
      if (!data['name'] || !data['role']) {
        console.warn(
          `Missing required fields (name or role) for team member: ${item.slug} in group ${group}`,
        );
      }

      members.push({
        slug: item.slug,
        name: data['name'] || item.slug, // Fallback to slug if name is missing
        role: data['role'] || 'Team Member', // Provide a default role if missing
        content,
        groupSlug: group,
        ...data,
      } as TeamMember);
    }

    // Sort by order field if present, or by name
    return members.sort((a, b) => {
      // If both have order, use that
      if (a['order'] !== undefined && b['order'] !== undefined) {
        return a['order'] - b['order'];
      }
      // If only one has order, prioritize that one
      if (a['order'] !== undefined) return -1;
      if (b['order'] !== undefined) return 1;

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
  } catch (error) {
    console.error(`Error getting team members for group ${group}:`, error);
    return [];
  }
}

export async function getProjectDirector(): Promise<TeamMember | null> {
  const directors = await getTeamMembersByGroup('project-director');
  return directors.length > 0 && directors[0] ? directors[0] : null;
}

export async function getTeamMember(group: string, slug: string): Promise<TeamMember | null> {
  const members = await getTeamMembersByGroup(group);
  return members.find((member) => member.slug === slug) || null;
}

// Get team members for a specific state/colony
export async function getTeamMembersByState(stateName: string) {
  // Find state directors
  const stateDirectorsAll = await getTeamMembersByGroup('state-directors');
  const stateDirectors = stateDirectorsAll.filter(
    (member) => member.state === stateName,
  );

  // Find historical partners
  const historicalPartnersAll = await getTeamMembersByGroup('historical-partners');
  const historicalPartners = historicalPartnersAll.filter(
    (member) => member.state === stateName,
  );

  // Find illustrators - handle both single state and array of states
  const illustratorsAll = await getTeamMembersByGroup('illustrators');
  const illustrators = illustratorsAll.filter((member) => {
    // Check if member.state is an array and contains stateName
    if (Array.isArray(member.state) && member.state.includes(stateName)) {
      return true;
    }
    // Check if member.state is a string that matches stateName
    return member.state === stateName;
  });

  // Find stitching groups
  const stitchingGroupsAll = await getTeamMembersByGroup('stitching-groups');
  const stitchingGroups = stitchingGroupsAll.filter(
    (member) => member.state === stateName,
  );

  return {
    stateDirectors,
    historicalPartners,
    illustrators,
    stitchingGroups,
  };
}