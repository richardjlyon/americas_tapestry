import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { extractExcerpt } from './markdown';

export interface Sponsor {
  slug: string;
  name: string;
  website?: string;
  tier?: string;
  location?: string;
  partnership_year?: number;
  logo?: string;
  logoPath: string;
  order?: number;
  content: string;
  excerpt: string;
  excerptHtml?: string;
}


/**
 * Format a sponsor name from slug or data
 * 
 * @param nameFromData Name from frontmatter data (if any)
 * @param slug Sponsor slug
 * @returns Formatted display name
 */
function formatSponsorName(nameFromData: string | undefined, slug: string): string {
  const baseName = nameFromData || slug.replace(/-/g, ' ');
  return baseName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get all sponsors
 * 
 * @returns Array of sponsor objects
 */
export function getAllSponsors(): Sponsor[] {
  const sponsorsDirectory = path.join(process.cwd(), 'content/sponsors');

  // Get all directories in the sponsors directory (excluding README.md)
  let sponsorFolders: string[] = [];
  try {
    sponsorFolders = fs
      .readdirSync(sponsorsDirectory, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);
  } catch (error) {
    console.error('Error reading sponsors directory:', error);
    return [];
  }

  const sponsors = sponsorFolders
    .map((folder) => {
      // Use the folder name as the slug
      const slug = folder;

      // Get the full path to the folder
      const folderPath = path.join(sponsorsDirectory, folder);

      // Read the index.md file
      const indexPath = path.join(folderPath, 'index.md');

      if (!fs.existsSync(indexPath)) {
        console.warn(`No index.md found in ${folderPath}`);
        return null;
      }

      const fileContents = fs.readFileSync(indexPath, 'utf8');

      // Parse the frontmatter and content
      const { data, content } = matter(fileContents);

      // Use simple convention: /images/sponsors/{slug}-logo.png
      const logoPath = `/images/sponsors/${folder}-logo.png`;

      // Create an excerpt from the content
      const excerpt = extractExcerpt(content);

      // Format the display name
      const displayName = formatSponsorName(data['name'], folder);

      // Return the sponsor data
      return {
        slug,
        name: displayName,
        website: data['website'] || '#',
        tier: data['tier'] || 'Supporter',
        location: data['location'] || '',
        partnership_year: data['partnership_year'],
        logo: `${folder}-logo.png`,
        logoPath,
        order: data['order'] || 999,
        content,
        excerpt,
      } as Sponsor;
    })
    .filter(Boolean) as Sponsor[];

  // Just sort alphabetically by name
  return sponsors.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get a single sponsor by slug
 * 
 * @param slug Sponsor slug
 * @returns Sponsor object or null if not found
 */
export function getSponsorBySlug(slug: string): Sponsor | null {
  const sponsorsDirectory = path.join(process.cwd(), 'content/sponsors');
  const folderPath = path.join(sponsorsDirectory, slug);
  const indexPath = path.join(folderPath, 'index.md');

  if (!fs.existsSync(indexPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(indexPath, 'utf8');
  const { data, content } = matter(fileContents);

  // Use simple convention: /images/sponsors/{slug}-logo.png
  const logoPath = `/images/sponsors/${slug}-logo.png`;

  // Create an excerpt from the content
  const excerpt = extractExcerpt(content);
    
  // Format the display name
  const displayName = formatSponsorName(data['name'], slug);

  return {
    slug,
    name: displayName,
    website: data['website'] || '#',
    tier: data['tier'] || 'Supporter',
    location: data['location'] || '',
    partnership_year: data['partnership_year'],
    logo: `${slug}-logo.png`,
    logoPath,
    order: data['order'] || 999,
    content,
    excerpt,
  } as Sponsor;
}
