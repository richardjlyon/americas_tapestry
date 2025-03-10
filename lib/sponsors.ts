import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

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
}

// Get all sponsors
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

      // Look for a logo file in the folder first (any image file)
      let logoPath = '';
      let logoFileName = data.logo;
      
      // If no logo specified in frontmatter, check for common image names
      if (!logoFileName) {
        // Check for common logo filenames
        const commonNames = [
          `${folder}-logo.png`, 
          `${folder}-logo.jpg`, 
          `${folder}-logo.jpeg`,
          `${folder}.png`, 
          `${folder}.jpg`, 
          `${folder}.jpeg`,
          'logo.png', 
          'logo.jpg', 
          'logo.jpeg'
        ];
        
        for (const name of commonNames) {
          if (fs.existsSync(path.join(folderPath, name))) {
            logoFileName = name;
            break;
          }
        }
      }
      
      // Construct logo path if we have a filename
      if (logoFileName) {
        logoPath = `/images/sponsors/${folder}/${logoFileName}`;
      } else {
        // Use placeholder with sponsor name
        logoPath = `/placeholder.svg?height=200&width=400&text=${encodeURIComponent(data.name || 'Sponsor')}`;
      }

      // Create an excerpt from the content (first paragraph)
      const excerpt = content
        .split('\n\n')[0]
        .replace(/^#+\s+.*\n/, '')
        .trim();

      // Create and format the display name
      let displayName = data.name || folder.replace(/-/g, ' ');
      displayName = displayName
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // Return the sponsor data
      return {
        slug,
        name: displayName,
        website: data.website || '#',
        tier: data.tier || 'Supporter',
        location: data.location || '',
        partnership_year: data.partnership_year,
        logo: logoFileName,
        logoPath,
        order: data.order || 999,
        content,
        excerpt,
      } as Sponsor;
    })
    .filter(Boolean) as Sponsor[];

  // Just sort alphabetically by name
  return sponsors.sort((a, b) => a.name.localeCompare(b.name));
}

// Get a single sponsor by slug
export function getSponsorBySlug(slug: string): Sponsor | null {
  const sponsorsDirectory = path.join(process.cwd(), 'content/sponsors');
  const folderPath = path.join(sponsorsDirectory, slug);
  const indexPath = path.join(folderPath, 'index.md');

  if (!fs.existsSync(indexPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(indexPath, 'utf8');
  const { data, content } = matter(fileContents);

  // Look for a logo file in the folder (any image file)
  let logoPath = '';
  let logoFileName = data.logo;
  
  // If no logo specified in frontmatter, check for common image names
  if (!logoFileName) {
    // Check for common logo filenames
    const commonNames = [
      `${slug}-logo.png`, 
      `${slug}-logo.jpg`, 
      `${slug}-logo.jpeg`,
      `${slug}.png`, 
      `${slug}.jpg`, 
      `${slug}.jpeg`,
      'logo.png', 
      'logo.jpg', 
      'logo.jpeg'
    ];
    
    for (const name of commonNames) {
      if (fs.existsSync(path.join(folderPath, name))) {
        logoFileName = name;
        break;
      }
    }
  }
  
  // Construct logo path if we have a filename
  if (logoFileName) {
    logoPath = `/images/sponsors/${slug}/${logoFileName}`;
  } else {
    // Use placeholder with sponsor name
    logoPath = `/placeholder.svg?height=200&width=400&text=${encodeURIComponent(data.name || 'Sponsor')}`;
  }

  // Create an excerpt from the content (first paragraph)
  const excerpt = content
    .split('\n\n')[0]
    .replace(/^#+\s+.*\n/, '')
    .trim();
    
  // Create and format the display name
  let displayName = data.name || slug.replace(/-/g, ' ');
  displayName = displayName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    slug,
    name: displayName,
    website: data.website || '#',
    tier: data.tier || 'Supporter',
    location: data.location || '',
    partnership_year: data.partnership_year,
    logo: logoFileName,
    logoPath,
    order: data.order || 999,
    content,
    excerpt,
  } as Sponsor;
}
