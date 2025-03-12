# America's Tapestry Website

A comprehensive showcase of the America's Tapestry project, a visual exploration of America's diverse cultural heritage through meticulously crafted tapestries representing each original colony.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint

# Copy content images to public directory (run after adding new content)
node scripts/copy-to-public.mjs
```

## Content Management Workflow

### Adding a New Tapestry

1. **Create Content Directory**
   - Create a folder in `/content/tapestries/[new-colony]`
   - Use the colony name as the folder name (e.g., `vermont`)

2. **Add Content Files**
   - Create `index.md` with colony information
   - Add images using consistent naming:
     - `[colony]-tapestry-main.jpg` (main image)
     - `[colony]-tapestry-thumbnail.png` (thumbnail)
   - Add audio description if available:
     - `[colony]-audio-description.mp3`

3. **Run Copy Script**
   ```
   node scripts/copy-to-public.mjs
   ```
   This copies your images to the public directory automatically.

4. **Restart/Rebuild**
   - In development: `npm run dev`
   - For production: `npm run build && npm run start`

### Best Practices

1. **Consistent Naming**
   - Always use the colony name as both folder name and image prefix
   - Example: `/content/tapestries/maryland/maryland-tapestry-main.jpg`

2. **Image Formats**
   - Main images: `.jpg` (better for photographs)
   - Thumbnails: `.png` or `.jpg` (either works now)
   - Ensure images are at least 1KB in size (not placeholders)

3. **Status Field**
   - Make sure to set the `status` in your markdown frontmatter:
     ```yaml
     ---
     title: Vermont
     summary: The Green Mountain State
     status: "In Production"  # or "Designed", "Not Started", "Finished"
     ---
     ```
   - Only tapestries with "In Production" or "Designed" status appear in the carousel

### Content Organization

1. **Directory Structure**
   ```
   content/
     └── tapestries/
         ├── connecticut/
         │   ├── connecticut-tapestry-main.jpg
         │   ├── connecticut-tapestry-thumbnail.png
         │   ├── connecticut-audio-description.mp3
         │   └── index.md
         ├── delaware/
         │   └── ...
         └── ...
   ```

2. **Image Serving**
   - Images are served from `/public/images/tapestries/`
   - Images are automatically copied from the content directory
   - Original content organization remains intact

## Project Structure

- `/app` - Next.js routes and page components
- `/components` - Reusable React components
- `/content` - Markdown and media files
- `/lib` - Utility functions and data fetching logic
- `/public` - Static assets including copied images
- `/scripts` - Utility scripts
- `/styles` - Global CSS styles

## Typography and Styling

### Using the Typography Plugin

This project uses the Tailwind Typography plugin for consistent, beautiful text styling in content-rich areas.

#### Basic Usage

1. Add the `content-typography` class to any container with rich text:

```jsx
<div className="content-typography">
  <h2>Section Title</h2>
  <p>This is a paragraph with nicely styled text...</p>
  <p>Another paragraph with proper spacing...</p>
  <a href="#">Styled link</a>
  <ul>
    <li>List items are also styled</li>
    <li>With proper spacing and bullets</li>
  </ul>
</div>
```

#### When to Use Typography Plugin

- Content-heavy sections with multiple paragraphs
- Blog posts and news articles
- About pages and information sections
- Anywhere with lists, blockquotes, or rich text elements

#### Benefits

- Proper vertical rhythm and spacing between elements
- Responsive text sizing for all devices
- Styled lists, blockquotes, and other HTML elements
- Colonial color scheme integration
- Consistent styling across the site

#### Customizing Typography

The typography styles are defined in `app/globals.css`. You can modify the `.content-typography` class to adjust font sizes, colors, and spacing.

### Page Spacing System

This project implements a comprehensive spacing system to maintain consistent vertical rhythm throughout the site. The system provides flexible control over spacing between sections and elements.

#### Three-Tier Spacing Approach

1. **Page-Level Spacing**
   - Wrap page content in spacing containers:
   ```jsx
   <div className="content-spacing-lg">
     {/* Page content */}
   </div>
   ```
   - Available options: `content-spacing-sm`, `content-spacing-md`, `content-spacing-lg`

2. **Section-Level Spacing**
   - Control padding around page sections:
   ```jsx
   <PageSection
     paddingTop="medium"
     paddingBottom="large"
     hasPin={true}
   >
     {/* Section content */}
   </PageSection>
   ```
   - Padding options: `none`, `small`, `medium`, `large`, `default`
   - The `hasPin` prop adds a decorative pin element

3. **Element-Level Spacing**
   - Apply margin utilities to individual elements:
   ```jsx
   <p className="lead-text mb-content-md">
     This paragraph has medium bottom margin
   </p>
   ```
   - Available margin utilities: `mb-content-sm`, `mb-content-md`, `mb-content-lg`

#### Usage Examples

**Basic Page Structure:**
```jsx
export default function ExamplePage() {
  return (
    <div className="content-spacing-lg">
      <h1 className="page-heading">Page Title</h1>

      <p className="lead-text mb-content-lg">
        Introduction paragraph with large bottom margin
      </p>

      <PageSection paddingTop="medium" paddingBottom="medium">
        <div className="content-spacing-md">
          <h2 className="section-title">Section Title</h2>
          <p>Section content...</p>
        </div>
      </PageSection>

      <PageSection paddingTop="medium" paddingBottom="large">
        <div className="content-spacing-md">
          <h2 className="section-title">Another Section</h2>
          <p>More content...</p>
        </div>
      </PageSection>
    </div>
  );
}
```

#### When to Use Each Spacing Type

- **content-spacing-sm**: For dense content areas with minimal spacing
- **content-spacing-md**: For standard content sections (most common)
- **content-spacing-lg**: For spacious layouts and landing pages

- **paddingTop/Bottom="small"**: For compact sections
- **paddingTop/Bottom="medium"**: For standard sections (most common)
- **paddingTop/Bottom="large"**: For prominent sections
- **paddingTop/Bottom="none"**: To remove padding on a specific side

- **mb-content-sm**: For tight grouping of related elements
- **mb-content-md**: For standard spacing between elements
- **mb-content-lg**: For emphasizing separation between elements

#### Benefits

- Consistent spacing throughout the site
- Responsive design with mobile-optimized spacing
- Flexible control for different page layouts
- Eliminates spacing inconsistencies between sections

## Technologies

- Next.js 15.2.1
- React 18
- TypeScript
- Tailwind CSS
- Tailwind Typography Plugin

.
